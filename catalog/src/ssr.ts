/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * Modified for petal-elements; modifications Copyright 2026 Saki. See NOTICE.
 */

// This file imports only files that will be SSRd e.g. if you can't SSR a
// component, don't import it here.
import 'petal-elements/all.js';
import './components/catalog-component-header.js';
import './components/catalog-component-header-title.js';
import './components/nav-drawer.js';
import './components/theme-changer.js';
import './components/top-app-bar.js';
import './components/drag-playground.js';
// 🤫
import 'petal-elements/item/item.js';
