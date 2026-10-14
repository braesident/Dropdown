# Dropdown (Bootstrap Extension)

This extension wraps a Bootstrap dropdown into a reusable JavaScript class (`Dropdown`) and adds:

- a searchable dropdown input
- a hidden input for stable form values
- dynamic item loading/replacement
- programmatic selection and reset
- an optional integrated list for multiple selected items
- optional swipe actions per item
- optional List.js integration

## Purpose and Use Cases

Use this when a plain Bootstrap dropdown is not enough, for example:

- large selectable lists with live filtering
- forms that must submit a stable value (`key`) through a hidden field
- dynamic data sources (Ajax/reload) without rebuilding markup manually
- extra interactions such as swipe delete or preselection

## Requirements

- Bootstrap 5 (or 4 via the built-in `window.bs4` fallback)
- jQuery (used internally)
- optional: List.js when using `listjs: true`

## Quick Start

HTML:

```html
<div id="countryDropdown"></div>
```

JavaScript:

```js
const dd = new Dropdown('countryDropdown', {
  placeholder: 'Select country',
  items: {
    de: { description: 'Germany' },
    at: { description: 'Austria' },
    ch: { description: 'Switzerland' }
  },
  onSelected: () => {
    const selected = dd.selected();
    console.log('Selected:', selected?.key, selected?.description);
  }
});
```

The selected value is stored in the hidden input with `name="countryDropdown"`.

## Initialization: Full Options List

```js
const dd = new Dropdown('exampleDropdown', {
  autoselectsingle: true,
  bootstrapmajor: 5,
  buttonstyle: 'btn-outline-secondary',
  caret: true,
  disabled: false,
  floatingbox: false,
  items: {},
  listjs: false,
  filter: true,
  menumaxheight: 'auto',
  menustyle: '',
  placeholder: '',
  required: false,
  selectionList: false,
  swipe: {
    trigger: 'swipe',
    left: {
      hint: false,
      label: '',
      action: false,
      condition: (idx, item, li) => true
    },
    right: {
      hint: false,
      label: '',
      action: false,
      condition: (idx, item, li) => true
    }
  },
  onSelected: e => {},
  onInput: (event, input) => {},
  onReplaceText: undefined,
  item: '<li>Entry</li>',
  valueNames: [],
  valueKey: undefined,
  bootstrapAutoClose: undefined
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `autoselectsingle` | `boolean` | `true` | Automatically selects the only visible match while typing (`false` disables this behavior). |
| `bootstrapmajor` | `number` | `5` | Bootstrap major version (`5` or `4`). |
| `buttonstyle` | `string` | `'btn-outline-secondary'` | Extra classes on the toggle button. |
| `caret` | `boolean` | `true` | Shows/hides the caret on the button (`false` disables it). |
| `disabled` | `boolean` | `false` | Disables input, toggle, and hidden input. |
| `floatingbox` | `boolean` | `false` | Enables Bootstrap floating-label behavior. With Bootstrap 5 and `filter: false`, the button uses `.form-select` and keeps the placeholder in the floated label. |
| `items` | `object` | `{}` | Initial entries. Keys become `data-value` / hidden-input value. |
| `listjs` | `boolean` | `false` | Enables List.js mode instead of native menu rendering. |
| `filter` | `boolean` | `true` | Enables/disables searchable input (`false` = button label only). |
| `menumaxheight` | `string` | `'auto'` | Dynamically uses the available viewport height. Placement prefers below, then above, then a side; 300px is used as the preferred placement height. Set a CSS length such as `'300px'` for a fixed limit. |
| `menustyle` | `string` | `''` | Additional inline style for the menu. |
| `placeholder` | `string` | `''` | Placeholder for the search input, the filterless button, or its floated label. |
| `required` | `boolean` | `false` | Sets `required` on the search input. |
| `selectionList` | `boolean\|object` | `false` | Enables an integrated, configurable list for multiple selected items. Passing an object enables it unless `enabled: false` is set. |
| `swipe.trigger` | `'swipe'\|'click'` | `'swipe'` | Native menu only: execute on swipe release, or reveal an action button that must be clicked/tapped. |
| `swipe.left.hint` | `string\|false` | `false` | HTML hint for left swipe (for example an icon). |
| `swipe.left.label` | `string` | `''` | Accessible action-button label in click mode; falls back to `Aktion links`. |
| `swipe.left.action` | `function\|false` | `false` | Callback on valid left swipe or confirmed hint click (`(event, li) => {}`). |
| `swipe.left.condition` | `function` | `(item) => true` | Condition to allow left swipe (`(idx, item, li) => boolean`). |
| `swipe.right.hint` | `string\|false` | `false` | HTML hint for right swipe. |
| `swipe.right.label` | `string` | `''` | Accessible action-button label in click mode; falls back to `Aktion rechts`. |
| `swipe.right.action` | `function\|false` | `false` | Callback on valid right swipe or confirmed hint click (`(event, li) => {}`). |
| `swipe.right.condition` | `function` | `(item) => true` | Condition to allow right swipe (`(idx, item, li) => boolean`). |
| `onSelected` | `function` | `(e) => {}` | Runs after an item is selected. |
| `onInput` | `function` | `(event, input) => {}` | Runs while typing/filtering. |
| `onReplaceText` | `function\|undefined` | `undefined` | Overrides default display-text replacement (click/focusout). |
| `item` | `string` | `'<li>Entry</li>'` | List.js item template (`listjs: true`). |
| `valueNames` | `array` | `[]` | List.js field definitions (`listjs: true`). |
| `valueKey` | `string\|undefined` | `auto` | Forces which List.js item field is used as internal key. |
| `bootstrapAutoClose` | `boolean\|undefined` | `undefined` | Relevant only for Bootstrap 4 fallback; `false` prevents `hide.bs.dropdown`. |

## Item Structure

A single `items` entry currently supports:

```js
items: {
  de: {
    description: 'Germany', // string | Element | { short, extended }
    disabled: false,        // optional
    active: false,          // optional, marks item as active/preselected
    selected: false,        // optional
    dataList: {             // optional extra attributes for item button
      'data-country-code': 'DE'
    }
  }
}
```

## Usage Snippets

### 1. Set items dynamically

```js
dd.setItems({
  fr: { description: 'France' },
  it: { description: 'Italy' }
});
```

### 2. Select programmatically

```js
await dd.selected('it'); // triggers click on item with key "it"
```

### 3. Clear selection / input

```js
dd.clear({
  resetSelection: true,
  resetInput: true,
  close: true
});
```

### 4. Disable automatic single-match selection

```js
const dd = new Dropdown('toDropdown', {
  listjs: true,
  autoselectsingle: false
});
```

### 5. Disable/enable dropdown

```js
dd.setDisabled(true);  // disable
dd.setDisabled(false); // enable
```

### 6. Swipe action on list entries

```js
const taskDd = new Dropdown('taskDropdown', {
  items: {
    1: { description: 'Task A' },
    2: { description: 'Task B' }
  },
  swipe: {
    left: {
      hint: '<i class="bi bi-trash"></i>',
      action: (event, li) => {
        console.log('Delete:', li);
        return true; // true => entry is removed with animation
      }
    }
  }
});
```

#### Reveal the hint and confirm with a click or tap

Set `swipe.trigger: 'click'` to keep the row shifted after a horizontal mouse or touch swipe. The action runs only when its revealed hint is clicked or tapped. This mode uses the native menu (`listjs: false`). Without this option, the existing immediate action on release remains the default.

```js
const storageDd = new Dropdown('storageDropdown', {
  autoselectsingle: false,
  items: {
    1: { description: 'Main warehouse', dataList: { 'data-stock': 0 } }
  },
  swipe: {
    trigger: 'click',
    left: {
      hint: '<i class="bi bi-trash3"></i>',
      label: 'Delete storage',
      condition: (idx, item) => Number(item.dataList['data-stock']) === 0,
      action: (event, li) => {
        console.log('Confirmed deletion:', li.querySelector('[data-value]').dataset.value);
        return false; // Keep the row; let the application handle removal after saving.
      }
    },
    right: {
      hint: '<i class="bi bi-pencil"></i>',
      label: 'Rename storage',
      action: (event, li) => {
        console.log('Open rename form:', li.querySelector('[data-value]').dataset.value);
        return false;
      }
    }
  }
});
```

- `left` means swiping left to reveal the action on the right; `right` reveals it on the left.
- Only one row per dropdown stays open. Swiping back, clicking the shifted row or outside it, pressing Escape, filtering, or closing the menu resets it without running the action.
- Vertical touch scrolling remains available. Disabled entries and disabled dropdowns cannot trigger an action. Conditions are checked when the hints are built, while revealing them, and again before execution.
- On a focused row, Left/Right Arrow reveals and focuses the corresponding action button. Enter/Space confirms it. Use `label` to name icon-only actions for screen readers.
- Returning `false` from `action` keeps the row; any other return value removes it. For asynchronous operations, return `false` immediately and update the list after the request succeeds. Server-side permissions and deletion constraints remain the application's responsibility.
- `clear()`, `setItems()` and `dispose()` clean up the click-swipe listeners; `setDisabled(true)` closes any revealed action.

### 7. Dispose cleanly (for example before DOM removal)

```js
dd.dispose();
```

### 8. Display multiple selected items inside the dropdown

```js
const recipientDropdown = new Dropdown('recipientDropdown', {
  placeholder: 'Add recipient',
  selectionList: {
    valueKey: 'email',
    labelKey: 'label',
    titleKey: 'email',
    itemClass: 'badge text-bg-primary d-inline-flex align-items-center gap-2',
    removeButtonClass: 'btn btn-sm p-0 border-0 text-white lh-1',
    getRemoveButtonAriaLabel: item => `Remove ${item.label}`,
    onChanged: items => console.log('Recipients:', items)
  }
});

recipientDropdown.addSelectedItem({
  email: 'person@example.com',
  label: 'Example Person'
});
```

The list is rendered as `.dropdown-selection-list` inside the dropdown container and does not need a separate element ID. Its default placement is before the search input. `placement: 'after-input'` moves it behind the input.

With `floatingbox: true`, the label remains at the leading edge and stays floated while selected items exist. A customized input placeholder is restored after the last selected item is removed.

The following `selectionList` properties control data and layout:

| Property | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` for object configuration | Explicitly enables or disables the list. |
| `containerClass` | `string` | Bootstrap input-group classes | Classes for the integrated list container. |
| `itemClass` | `string` | Bootstrap secondary badge classes | Classes for each selected item. |
| `labelClass` | `string` | `'dropdown-selection-label'` | Classes for the item label. |
| `removeButtonClass` | `string` | Bootstrap small button classes | Classes for each remove button. |
| `removeButtonText` | `string` | `'×'` | Default remove-button content. |
| `itemTag` | `string` | `'span'` | HTML tag used for each selected item. |
| `placement` | `string` | `'before-input'` | Use `'after-input'` to place the list after the search input. |
| `valueKey` | `string` | `'key'` | Item property used as the stable, unique key. |
| `labelKey` | `string` | `'label'` | Item property used as visible text. |
| `titleKey` | `string\|null` | `null` | Optional item property copied to the `title` attribute. |
| `getKey` | `function\|null` | `null` | Custom key resolver: `(item, dropdown) => key`. |
| `getLabel` | `function\|null` | `null` | Custom label resolver: `(item, dropdown) => label`. |
| `renderItem` | `function\|null` | `null` | Returns text or a DOM node for the label area. |
| `renderRemoveButton` | `function\|null` | `null` | Returns text or a DOM node for the remove button. |
| `getRemoveButtonAriaLabel` | `string\|function\|null` | `null` | Accessible remove-button label or resolver. |
| `onRemove` | `function\|null` | `null` | Runs before removal; returning `false` cancels it. |
| `onChanged` | `function\|null` | `null` | Runs after list changes: `(items, dropdown) => {}`. |

Changes also dispatch the bubbling `dropdown-selection-list-changed` event on the dropdown container.

## Important Methods (Short Overview)

- `setItems(items, callback?, options?)`: add new entries / re-render
- `selected()`: get currently selected item
- `selected(key)`: select item by key
- `selected(null)`: clear current selection
- `selectedItems()`: get all integrated selection-list items
- `setSelectedItems(items)`: replace all integrated selection-list items
- `addSelectedItem(item)`: add one item unless its key already exists
- `removeSelectedItem(keyOrItem)`: remove one item by key or item
- `clearSelectedItems()`: remove all integrated selection-list items
- `clear(options?)`: clear items/selection in a controlled way
- `setDisabled(state)`: enable/disable interaction
- `getInput()`: current visible input text
- `matchItem()`: number of exact matches for current input
- `dispose()`: remove listeners/instance safely

## Notes

- With `filter: false`, the component uses a button label instead of a search input.
- When `listjs: true`, List.js must be available, otherwise initialization is incomplete.
- The container dispatches custom events including `dropdown-items-rendered`.
