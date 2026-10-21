/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

import '../../focus/md-focus-ring.js';
import '../../ripple/ripple.js';

import {html, isServer, LitElement, nothing} from 'lit';
import {property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {literal, html as staticHtml} from 'lit/static-html.js';

import {ARIAMixinStrict} from '../../internal/aria/aria.js';
import {mixinDelegatesAria} from '../../internal/aria/delegate.js';
import {isRtl} from '../../internal/controller/is-rtl.js';
import {safeHref} from '../../internal/directives/safe-href.js';
import {
  afterDispatch,
  setupDispatchHooks,
} from '../../internal/events/dispatch-hooks.js';
import {mixinElementInternals} from '../../behaviors/element-internals.js';
import {mixinFormAssociated} from '../../behaviors/form-associated.js';
import {mixinFormSubmitter} from '../../behaviors/form-submitter.js';

type LinkTarget = '_blank' | '_parent' | '_self' | '_top';

// Separate variable needed for closure.
/** Material 3 Expressive icon button sizes. */
export type IconButtonSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

/**
 * How the icon moves while a mouse hovers the button (a petal-elements
 * addition): `forward` 3px toward the inline end, `down` 2px, `external` 2px
 * up and toward the end, `turn` 60°, `spin` 90°, `grow` to 1.15 times, or
 * `none`.
 */
export type IconMotion = 'forward' | 'down' | 'external' | 'turn' | 'spin' | 'grow' | 'none';

/** Material Symbols names and the motion they suggest. */
const ICON_MOTIONS: {[name: string]: IconMotion} = {
  'arrow_forward': 'forward',
  'arrow_forward_ios': 'forward',
  'arrow_right_alt': 'forward',
  'chevron_right': 'forward',
  'navigate_next': 'forward',
  'east': 'forward',
  'send': 'forward',
  'download': 'down',
  'file_download': 'down',
  'arrow_downward': 'down',
  'open_in_new': 'external',
  'launch': 'external',
  'arrow_outward': 'external',
  'north_east': 'external',
  'settings': 'turn',
  'refresh': 'spin',
  'autorenew': 'spin',
  'sync': 'spin',
  'favorite': 'grow',
  'favorite_border': 'grow',
  'star': 'grow',
  'star_border': 'grow',
  'thumb_up': 'grow',
};

const iconButtonBaseClass = mixinDelegatesAria(
  mixinFormSubmitter(mixinFormAssociated(mixinElementInternals(LitElement))),
);

/**
 * A button for rendering icons.
 *
 * @fires input {InputEvent} Dispatched when a toggle button toggles --bubbles
 * --composed
 * @fires change {Event} Dispatched when a toggle button toggles --bubbles
 *
 * @slot - The icon: a `<petal-icon>` or an `<svg>`.
 * @slot selected - The icon of a selected toggle button; the default slot's icon
 *     when empty.
 * @slot badge - A `petal-badge`, placed on the icon's top end.
 */
export class IconButton extends iconButtonBaseClass {
  /** @nocollapse */
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  /**
   * "Soft-disables" the icon button (disabled but still focusable).
   *
   * Use this when an icon button needs increased visibility when disabled. See
   * https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls
   * for more guidance on when this is needed.
   */
  @property({type: Boolean, attribute: 'soft-disabled', reflect: true})
  softDisabled = false;

  /**
   * Flips the icon if it is in an RTL context at startup.
   */
  @property({type: Boolean, attribute: 'flip-icon-in-rtl'})
  flipIconInRtl = false;

  /**
   * Sets the underlying `HTMLAnchorElement`'s `href` resource attribute.
   */
  @property() href = '';

  /**
   * The filename to use when downloading the linked resource.
   * If not specified, the browser will determine a filename.
   * This is only applicable when the icon button is used as a link (`href` is set).
   */
  @property() download = '';

  /**
   * Sets the underlying `HTMLAnchorElement`'s `target` attribute.
   */
  @property() target: LinkTarget | '' = '';

  /**
   * Sets the underlying `HTMLAnchorElement`'s `rel` attribute when `href` is
   * set.
   */
  @property() rel = '';

  /**
   * Sets the underlying `HTMLAnchorElement`'s `referrerpolicy` attribute when
   * `href` is set.
   */
  @property() referrerPolicy = '';

  /**
   * The `aria-label` of the button when the button is toggleable and selected.
   */
  @property({attribute: 'aria-label-selected'}) ariaLabelSelected = '';

  /**
   * When true, the button will toggle between selected and unselected
   * states
   */
  @property({type: Boolean}) toggle = false;

  /**
   * Sets the selected state. When false, displays the default icon. When true,
   * displays the selected icon, or the default icon If no `slot="selected"`
   * icon is provided.
   */
  @property({type: Boolean, reflect: true}) selected = false;

  /**
   * Material 3 Expressive size (Compose's XSmall…XLargeIconButtonTokens):
   * `xsmall` (32px), `small` (40px), `medium` (56px), `large` (96px) or
   * `xlarge` (136px) high. Sized icon buttons morph their shape when pressed
   * or selected. Without it, the button keeps its original 40px look.
   */
  @property({reflect: true}) size?: IconButtonSize;

  /**
   * The width of a sized icon button (Compose's `IconButtonWidthOption`):
   * `narrow`, `default` or `wide`.
   */
  @property({reflect: true}) width?: 'narrow' | 'default' | 'wide';

  /** The shape of a sized icon button: `round` (default) or `square`. */
  @property({reflect: true}) shape?: 'round' | 'square';

  /**
   * How the icon moves while a mouse hovers the button. Without it, the motion
   * follows the icon's name (`arrow_forward` moves forward, `download` down,
   * `open_in_new` out, `settings` turns, `refresh` spins, `favorite` and
   * `star` grow); `none` keeps it still.
   */
  @property({attribute: 'icon-motion'}) iconMotion?: IconMotion;

  @state() private flipIcon = isRtl(this, this.flipIconInRtl);

  /** The motion the slotted icon's name suggests. */
  @state() private namedMotion: IconMotion = 'none';

  constructor() {
    super();
    if (isServer) return;
    setupDispatchHooks(this, 'click');
    this.addEventListener(
      'click',
      (event) => {
        // If the button is soft-disabled or a disabled link, we need to
        // explicitly prevent the click from propagating to other event listeners
        // as well as prevent the default action. This is because the underlying
        // `<button>` or `<a>` element is not actually `:disabled`.
        if (this.softDisabled || (this.disabled && this.href)) {
          event.stopImmediatePropagation();
          event.preventDefault();
          return;
        }

        // Save current selected state to toggle, since an external event listener
        // may also change the selected state on click.
        const wasSelected = this.selected;
        afterDispatch(event, () => {
          if (!this.toggle || this.disabled || event.defaultPrevented) {
            return;
          }

          this.selected = !wasSelected;
          this.dispatchEvent(
            new InputEvent('input', {bubbles: true, composed: true}),
          );
          // Bubbles but does not compose to mimic native browser <input> & <select>
          // Additionally, native change event is not an InputEvent.
          this.dispatchEvent(new Event('change', {bubbles: true}));
        });
      },
      {capture: true},
    );
  }

  protected override willUpdate() {
    // Link buttons cannot be disabled or soft-disabled.
    if (this.href) {
      this.disabled = false;
      this.softDisabled = false;
    }
  }

  protected override render() {
    const tag = this.href ? literal`div` : literal`button`;
    // Needed for closure conformance
    const {ariaLabel, ariaHasPopup, ariaExpanded} = this as ARIAMixinStrict;
    const hasToggledAriaLabel = ariaLabel && this.ariaLabelSelected;
    const ariaPressedValue = !this.toggle ? nothing : this.selected;
    let ariaLabelValue: string | null | typeof nothing = nothing;
    if (!this.href) {
      ariaLabelValue =
        hasToggledAriaLabel && this.selected
          ? this.ariaLabelSelected
          : ariaLabel;
    }
    return staticHtml`<${tag}
        class="icon-button ${classMap(this.getRenderClasses())}"
        id="button"
        aria-label="${ariaLabelValue || nothing}"
        aria-haspopup="${(!this.href && ariaHasPopup) || nothing}"
        aria-expanded="${(!this.href && ariaExpanded) || nothing}"
        aria-pressed="${ariaPressedValue}"
        aria-disabled=${(!this.href && this.softDisabled) || nothing}
        ?disabled="${!this.href && this.disabled}">
        ${this.renderFocusRing()}
        ${this.renderRipple()}
        ${!this.selected ? this.renderIcon() : nothing}
        ${this.selected ? this.renderSelectedIcon() : nothing}
        ${this.href ? this.renderLink() : this.renderTouchTarget()}
  </${tag}>`;
  }

  private renderLink() {
    // Needed for closure conformance
    const {ariaLabel} = this as ARIAMixinStrict;
    return html`
      <a
        class="link"
        id="link"
        href=${safeHref(this.href)}
        download="${this.download || nothing}"
        target="${this.target || nothing}"
        rel=${this.rel || nothing}
        referrerpolicy=${this.referrerPolicy || nothing}
        aria-label="${ariaLabel || nothing}">
        ${this.renderTouchTarget()}
      </a>
    `;
  }

  protected getRenderClasses() {
    return {
      'flip-icon': this.flipIcon,
      'selected': this.toggle && this.selected,
      [`motion-${this.iconMotion ?? this.namedMotion}`]: true,
    };
  }

  private renderIcon() {
    return html`<span class="icon"
      ><slot @slotchange=${this.handleIconChange}></slot
      ><slot name="badge"></slot
    ></span>`;
  }

  private renderSelectedIcon() {
    // Use default slot as fallback to not require specifying multiple icons
    return html`<span class="icon icon--selected"
      ><slot name="selected"><slot></slot></slot
      ><slot name="badge"></slot
    ></span>`;
  }

  private handleIconChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const icon = slot.assignedElements({flatten: true})[0];
    const name = icon?.textContent?.trim().toLowerCase() ?? '';
    this.namedMotion = ICON_MOTIONS[name] ?? 'none';
  }

  private renderTouchTarget() {
    return html`<span class="touch"></span>`;
  }

  private renderFocusRing() {
    // TODO(b/310046938): use the same id for both elements
    return html`<petal-focus-ring
      part="focus-ring"
      for=${this.href ? 'link' : 'button'}></petal-focus-ring>`;
  }

  private renderRipple() {
    const isRippleDisabled = !this.href && (this.disabled || this.softDisabled);
    // TODO(b/310046938): use the same id for both elements
    return html`<petal-ripple
      for=${this.href ? 'link' : nothing}
      ?disabled="${isRippleDisabled}"></petal-ripple>`;
  }

  override connectedCallback() {
    this.flipIcon = isRtl(this, this.flipIconInRtl);
    super.connectedCallback();
  }
}
