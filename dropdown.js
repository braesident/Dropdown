class Dropdown {

  options = {
    bootstrapmajor: 5,
    buttonstyle: 'btn-outline-secondary', // add to classlist
    disabled: false,
    floatingbox: false,
    items: {},
    listjs: false,
    menumaxheight: '300px',
    menustyle: '',
    placeholder: '',
    required: false,
    swipe: {
      left: {
        hint: false, // content
        action: false, // callback
        // eslint-disable-next-line no-unused-vars
        condition: item => true
      },
      right: {
        hint: false,
        action: false,
        // eslint-disable-next-line no-unused-vars
        condition: item => true
      }
    },
    /**
     * After item clicked and handled
     * @param {Event} e
     */
    onSelected: e => { e; /* console.log('item seleced', e); */ },
    onInput: (event, input) => { event, input; /* console.log('item seleced', event, input); */ },
    /**
     * On click on item and restoring on focusout
     */
    onReplaceText: undefined,

    // List.js
    item: '<li>Entry</li>',
    valueNames: []
  };

  #itemsRendered = true;

  #listjs;

  /**
   * @callback ItemClickCallback
   * @param {Event} e
   * @param {Dropdown} t
   */

  /**
   * @callback itemSelectedCallback
   * @param {Event} e
   */

  /**
   * @callback inputCallback
   * @param {Event} e
   */

  /**
   * @callback swipeAction
   * @param {Event} e
   * @param {Element} li
   */

  /**
   * @callback swipeCondition
   * @param {int} idx Index of item in Dropdown list
   * @param {object} item Dropdown item
   * @param {Element} li Rendered li-Element
   */

  /**
   *
   * @param {string} elementselector element ID
   * @param {object} options Option object
   * @param {int} options.bootstrapmajor Defines the Bootstrap major version. Default: 5 For backwards compatibility you can use 4
   * @param {string} options.buttonstyle Add class attributes like bootstrap designs
   * @param {boolean} options.floatingbox Set to true if you have bootstraps floating elements
   * @param {object} options.items Object set for the selectable items
   * @param {string} options.menumaxheight Style option for the maximum height of the menu. Default: 300px
   * @param {string} options.menustyle Add class attributes like bootstrap designs for the menu
   * @param {string} options.placeholder Set an input placeholder
   * @param {boolean} options.required Set to true if the value required for a form
   * @param {boolean} options.disabled Set to true if the dropdown should disabled
   * @param {ItemClickCallback} options.onItemClick Replace code on click item
   * @param {itemSelectedCallback} options.onSelected Runs code after selection a menu entry
   * @param {inputCallback} options.onInput Runs an additional code on input
   * @param {object} options.swipe Object to descripe swipe actions
   * @param {object} options.swipe.left
   * @param {swipeAction} options.swipe.left.action define a callback method for an action
   * @param {swipeCondition} options.swipe.left.condition define a callback method for a condition
   * @param {string} options.swipe.left.hint Add html for hint. e.g. bootstrap-icon
   * @param {object} options.swipe.right
   * @param {swipeAction} options.swipe.right.action define a callback method for an action
   * @param {swipeCondition} options.swipe.right.condition define a callback method for a condition
   * @param {string} options.swipe.right.hint Add html for hint. e.g. bootstrap-icon
   */
  constructor (elementselector, options = {}) {
    this.id = elementselector;
    this.container = document.getElementById(elementselector);

    this.options = this.#merge(this.options, options);
    this.items = this.options.items;

    this._ns = `.exudd-${this.id}`;
    this._onDocPointerDown = null;

    this.options.onReplaceText = this.options.onReplaceText ?? this.#replaceText;

    this.#prepareContainer();
    if (!this.options.listjs) this.#fillMenu();
    this.#setListener();
    // start implement dispose()
  }

  clear (options = {}) {
  // Optionen:
  // resetSelection: Hidden-Value & Auswahl zurücksetzen (default: true)
  // resetInput:     sichtbaren Text im Input leeren (default: true)
  // close:          ggf. geöffnetes Dropdown schließen (default: true)
    const {
      resetSelection = true,
      resetInput     = true,
      close          = true,
    } = options;

    // Falls bereits disposed
    if (!this.container) return;

    // ggf. Dropdown schließen (verhindert Flackern beim Leeren)
    if (close) {
      try { this.dd?.hide(); } catch { /* empty */ }
    }

    // Inhalte leeren
    this.#itemsRendered = false;

    if (this.options.listjs && this.#listjs) {
    // List.js-Variante
      try { this.#listjs.clear(); } catch { /* empty */ }
    } else {
    // Native-Variante
      this.items = {};
      if (this.ul) this.ul.innerHTML = '';
    }

    // Auswahl / Werte zurücksetzen
    if (resetSelection) {
      const $root = $(`#${this.id}`);
      $root.data('item-choice', '0');
      // Hidden-Input zurücksetzen
      $root.find('input[type=hidden]')
        .data('value', null)
        .prop('data-value', null)
        .val(null)
        .trigger('change');

      // Sichtbares Input ggf. leeren oder via onReplaceText(null) den alten Zustand wiederherstellen
      if (resetInput) {
        this.ddInput && (this.ddInput.value = '');
      } else if (typeof this.options.onReplaceText === 'function') {
      // Falls du beim Clear lieber den alten Text wiederherstellen willst (optional):
        this.options.onReplaceText(null, this);
      }

      // interne Selektion zurücksetzen
      this.unselect();
    }

    // Rendering-Flag zurück und "cleared"-Event feuern
    this.#itemsRendered = true;
    try {
      this.container.dispatchEvent(new CustomEvent('dropdown-items-rendered', { bubbles: true }));
      // optional zusätzlich: "cleared"
      this.container.dispatchEvent(new CustomEvent('dropdown-items-cleared', { bubbles: true }));
    } catch { /* empty */ }

    // Wenn das Menü offen ist, Popper neu positionieren
    if (this.dd?._popper && (this.ul?.classList.contains('show') || this.toggle?.classList.contains('show'))) {
      try { this.dd._popper.update(); } catch { /* empty */ }
    }
  }

  dispose () {
    const ns = this._ns || `.exudd-${this.id}`;
    const $root  = this.id ? $(`#${this.id}`) : $();
    const $input = $root.find('.dropdown-search');
    const $menu  = $root.find('.dropdown-menu');

    if (this._onDocPointerDown) {
      try { document.removeEventListener('pointerdown', this._onDocPointerDown, { capture: true }); } catch { /* empty */ }
    }

    try { $input.off(ns); } catch { /* empty */ }
    try { $menu.off(ns); } catch { /* empty */ }
    try { $(this.container).off(ns); } catch { /* empty */ }
    try { $(this.toggle).off(ns); } catch { /* empty */ }

    if (this.dd) {
      try { this.dd.hide(); } catch { /* empty */ }
      try { this.dd.dispose(); } catch { /* empty */ }
    }

    if (this.#listjs) {
      try { this.#listjs.clear(); } catch { /* empty */ }
      this.#listjs = null;
    }

    try { $root.removeData('item-choice'); } catch { /* empty */ }

    this.ddInput = null;
    this.ul = null;
    this.toggle = null;
    this.container = null;
    this.items = {};
    this.options = {};
    this.dd = null;

    this._onDocPointerDown = null;
    this._ns = null;
    this.#itemsRendered = false;
  }

  getInput = () => this.ddInput.value;

  matchItem = () => Object.entries(this.items)
    .filter(item => item[1].description == this.ddInput.value).length;

  setDisabled = state => {
    let hiddenInput = this.container.querySelector('input[type=hidden]');
    // let button = this.container.querySelector('button[data-bs-toggle=dropdown]');
    this.ddInput.disabled = hiddenInput.disabled = this.toggle.disabled = state;
  };

  setItems = (items, callback) => {
    if (this.options.listjs) {
      this.#listjs.add(items, callback);
    } else {
      this.items = { ...this.items, ...items };
      this.#fillMenu();
    }
    // egal ob list.js oder nicht: Position refreshen, falls offen
    if (this.ul.classList.contains('show') || this.toggle.classList.contains('show')) {
      this.dd._popper && this.dd._popper.update();
    }
  };

  #fillMenu = () => {
    if (Object.keys(this.items).length) {
      this.#itemsRendered = false;
      this.ul.innerHTML = '';

      let hasSwipeAction = 0;

      for (const [ idx, item ] of Object.entries(this.items ?? {})) {
        let li = document.createElement('li'),
          button = document.createElement('button');

        button.type = 'button';
        button.classList = 'dropdown-item border-bottom';
        button.setAttribute('data-value', idx);
        button.disabled = (item.disabled ? item.disabled : false);
        button.innerHTML = item.description ?? '';

        if (item.dataList)
          for (const [ key, value ] of Object.entries(item.dataList ?? {}))
            button.setAttribute(key, value);

        li.classList.add('position-relative');
        li.appendChild(button);

        let leftSwipeAllowed = this.options?.swipe?.left?.condition(idx, item, li) ?? true;
        let rightSwipeAllowed = this.options?.swipe?.right?.condition(idx, item, li) ?? true;

        if ((this.options?.swipe?.left?.hint ?? false) && leftSwipeAllowed) {
          hasSwipeAction = hasSwipeAction | 1;
          let span = document.createElement('span');
          span.classList = 'action-hint btn text-danger position-absolute end-100 top-0';
          span.innerHTML = this.options?.swipe?.left?.hint;
          li.appendChild(span);
        }

        if ((this.options?.swipe?.right?.hint ?? false) && rightSwipeAllowed) {
          hasSwipeAction = hasSwipeAction | 2;
          let span = document.createElement('span');
          span.classList = 'action-hint btn text-info position-absolute start-100 top-0';
          span.innerHTML = this.options?.swipe?.right?.hint;
          li.appendChild(span);
        }

        if (this.options?.swipe?.left?.hint || this.options?.swipe?.right?.hint) {
          let startX = 0;
          let currentX = 0;
          let dragging = false;
          let wasDragged = false;
          let options = this.options;

          // Mouse
          li.addEventListener('mousedown', function (e) {

            dragging = true;
            startX = e.clientX;
            li.style.transition = 'none';
            document.body.style.userSelect = 'none';
            wasDragged = false;
          });
          document.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            currentX = e.clientX - startX;
            li.style.transform = `translateX(${currentX}px)`;
            li.classList.add('moving');
            if (Math.abs(currentX) > 10) { // 10px als "Drag" erkannt
              wasDragged = true;
            }
          });
          document.addEventListener('mouseup', function (e) {
            if (!dragging) return;

            li.style.transition = '';
            li.classList.remove('moving');
            dragging = false;
            document.body.style.userSelect = '';

            const isLeft = currentX < 0;
            const isRight = currentX > 0;
            const swipeAllowed = (isLeft && leftSwipeAllowed) || (isRight && rightSwipeAllowed);
            const action = isLeft ? options?.swipe?.left?.action : options?.swipe?.right?.action;

            if (Math.abs(currentX) > 80 && swipeAllowed && typeof action === 'function') {

              if (action(e, li) !== false) {
                li.style.transform = `translateX(${isLeft ? '-' : ''}120%)`;
                li.classList.add('removing');
                setTimeout(() => li.remove(), 300);
              } else {
                li.style.transform = '';
              }
            } else {
              li.style.transform = '';
            }
            currentX = 0;
            // Wichtig: Click kommt erst jetzt, ggf. noch auf das gleiche li!
            setTimeout(() => { wasDragged = false; }, 100);
          });

          // Click verhindern, wenn ein Drag war
          li.addEventListener('click', function (e) {
            if (wasDragged) {
              e.stopPropagation();
              e.preventDefault();
              // Event nicht weiterreichen!
              wasDragged = false;
              return false;
            }
          }, true); // **Capture-Phase!**
        }

        this.ul.appendChild(li);
      }

      if (hasSwipeAction) {
        let div = document.createElement('div'),
          code = document.createElement('code');
        div.classList.add('text-center');
        code.innerText = 'Swipe für Aktion';
        code.style.fontSize = '0.6rem';
        code.classList.add('cursor-default');
        div.append(code);
        this.ul.appendChild(div);
      }

      setTimeout(() => {
        this.#itemsRendered = true;
        this.container.dispatchEvent(new CustomEvent('dropdown-items-rendered', { bubbles: true }));
      }, 350);
    }
  };

  #replaceText = e => {
    if (null == e) return;

    if (e.type == 'click') {
      $('input[type=text]', $(`#${this.id}`))
        .val($(e.currentTarget).text().trim());
    } else if (e.type == 'focusout') {
      let key = $('input[type=hidden]', $(`#${this.id}`)).data('value');
      $(e.currentTarget)
        .val($(`#${this.id} .dropdown-menu li > *[data-value="${key}"]`).text().trim());
    }
  };

  #prepareContainer = () => {

    let hiddenInput = document.createElement('input'),
      label = document.createElement('label'),
      // bootstrap4buttonwrapper = document.createElement('div'),
      span = document.createElement('span'),
      bs = (this.options.bootstrapmajor == 5 ? 'bs-' : '');

    this.ddInput = document.createElement('input');
    this.ul = document.createElement('ul');
    this.toggle = document.createElement('button');

    this.ddInput.id = this.id + '-input';
    this.ddInput.type = 'text';
    this.ddInput.classList = 'form-control dropdown-search';
    this.ddInput.setAttribute('autocomplete', 'off');
    this.ddInput.setAttribute('placeholder', this.options.placeholder);
    this.ddInput.disabled = this.options.disabled;
    this.ddInput.required = this.options.required;
    this.ddInput.value = this.selected()?.description ?? '';

    hiddenInput.name = this.id;
    hiddenInput.type = 'hidden';
    hiddenInput.disabled = this.options.disabled;
    hiddenInput.setAttribute('data-changed', '0');
    hiddenInput.setAttribute('data-value', this.selected()?.key ?? '');
    hiddenInput.value = this.selected()?.key;

    label.setAttribute('for', this.id + '-input');
    label.innerHTML = this.options.placeholder;

    this.toggle.type = 'button';
    this.toggle.classList = 'btn btn-sm dropdown-toggle dropdown-toggle-split '
      + (this.options.bootstrapmajor == 4 ? ' flex-grow-0 flex-shrink-0 ' : '')
      + this.options.buttonstyle;
    this.toggle.setAttribute('data-' + bs + 'toggle', 'dropdown');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.disabled = this.options.disabled;
    span.className = (this.options.bootstrapmajor == 5 ? 'visually-hidden' : 'sr-only');
    span.textContent = 'Toggle Dropdown';
    this.toggle.appendChild(span);

    this.ul.classList.add('dropdown-menu');
    // if (!this.options.listjs) this.ul.classList.add('overflow-y-auto');
    if (this.options.listjs) this.ul.classList.add('list', 'overflow-y-auto', 'w-100', 'mt-1');
    this.ul.style = 'max-height: '
      + (this.options.menumaxheight ? this.options.menumaxheight : 'unset')
      + this.options.menustyle;

    this.container.classList += ' input-group dropdown-text dropdown'
      .concat(this.options.floatingbox ? ' form-floating' : '')
      .concat(this.options.bootstrapmajor == 4 ? ' btn-group ' : '');
    this.container.setAttribute('aria-expanded', 'false');

    this.container.appendChild(this.ddInput);
    this.container.appendChild(hiddenInput);
    if (this.options.floatingbox)
      this.container.appendChild(label);
    this.container.appendChild(this.toggle);
    this.container.appendChild(this.ul);

    setTimeout(() => label.style = 'left: ' + this.ddInput.offsetLeft + 'px; z-index: 10', 350);
    label.style = 'left: ' + this.ddInput.offsetLeft + 'px; z-index: 10';

    // Hilfreich auch als HTML-Attribut am Container:
    this.container.setAttribute('data-bs-auto-close', 'outside');

    // Erzeuge/halte die Dropdown-Instanz (einmal!)
    // eslint-disable-next-line no-undef
    this.dd = bootstrap.Dropdown.getOrCreateInstance(this.toggle, {
      autoClose: false,                            // wichtig!
      reference: 'toggle',
      popperConfig: { placement: 'bottom-start' }  // Position sauber
    });

    if (this.options.listjs) {
      this.#listjs = new ListJS(this.id, {
        item: this.options.item,
        searchClass: 'dropdown-search',
        valueNames: this.options.valueNames
      });
    }
  };

  #setListener = () => {
    setTimeout(() => {
      const ns = (this._ns ||= `.exudd-${this.id}`);
      const $root = $(`#${this.id}`);
      const $input = $root.find('.dropdown-search');
      const $menu  = $root.find('.dropdown-menu');

      // Alte Listener weg
      $input.off(ns);
      $menu.off(ns);
      $(document).off(ns);
      $(this.container).off(ns);

      this._onDocPointerDown = e => {
        // container kann beim Disposen schon null sein -> optionaler Zugriff
        if (this.container && !this.container.contains(e.target)) {
          try { this.dd?.hide(); } catch { /* empty */ }
        }
      };

      // Beim Öffnen: Outside-Close aktivieren + Popper updaten
      $(this.container).on(`shown.bs.dropdown${ns}`, () => {
        document.addEventListener('pointerdown', this._onDocPointerDown, { capture: true });
        queueMicrotask(() => this.dd?._popper && this.dd._popper.update());
      });

      // Beim Schließen: Outside-Close wieder entfernen + ggf. Text restaurieren
      $(this.container).on(`hidden.bs.dropdown${ns}`, () => {
        document.removeEventListener('pointerdown', this._onDocPointerDown, { capture: true });

        // Wenn kein Item gewählt wurde, Text zurücksetzen
        if ($root.data('item-choice') == '0') {
          const key = $root.find('input[type=hidden]').data('value');
          if (key && this.options.onReplaceText) {
          // fake "focusout"-Event für deine onReplaceText-Logik
            this.options.onReplaceText({ type: 'focusout', currentTarget: this.ddInput }, this);
          }
        }
      });

      // INPUT: auf Fokus öffnen (nur API, KEINE Klassen toggeln)
      $input.on(`focus${ns}`, e => {
        this.dd.show();
        // Fokus sicher auf dem Input halten (Safari/Firefox)
        setTimeout(() => e.currentTarget.focus(), 0);
        // Liste sichtbar => reset Filter
        $root.find('.dropdown-menu li').removeClass('d-none');
      });

      // Optional: ESC zum Schließen
      $input.on(`keydown${ns}`, e => {
        if (e.key === 'Escape') this.dd.hide();
      });

      // Mousedown auf Menü NICHT den Fokus vom Input stehlen lassen
      // (verhindert „Focusout“-Effekte, die zu sofortigem Schließen führen)
      $menu.on(`mousedown${ns}`, e => e.preventDefault());

      // Item-Klick: wählen, schreiben, schließen
      $menu.on(`click${ns}`, 'li > *', e => {
        this.options.onReplaceText?.(e, this);
        $root.find('input[type=hidden]')
          .data('value', $(e.currentTarget).data('value'))
          .prop('data-value', $(e.currentTarget).data('value'))
          .val($(e.currentTarget).data('value'))
          .trigger('change');
        $root.data('item-choice', '1');
        this.unselect();
        this.#setSelected($(e.currentTarget).data('value'));
        this.options.onSelected?.(e);
        this.dd.hide();
        // this.ddInput.focus(); // komfortabel weiter tippen
      });

      let _autoSelTimer = null;
      $input.on(`input${ns} change${ns}`, () => {
        clearTimeout(_autoSelTimer);
        _autoSelTimer = setTimeout(() => {
          this.#autoSelectIfUnambiguous();
        }, 120);
      });

      // Live-Filter (ohne list.js)
      if (!$menu.hasClass('list')) {
        $input.on(`keyup${ns} paste${ns}`, e => {
          $root.find('.dropdown-menu li').removeClass('d-none').each((idx, item) => {
            if (!$('> *', item).text().trim().includes($(e.currentTarget).val().split(' '))) {
              $(item).addClass('d-none');
            }
          });
          this.dd._popper && this.dd._popper.update();
          this.options.onInput?.(e, $(e.currentTarget).val());
        });
      }
    }, 0);
  };

  #setSelected = key => {
    if (this.items[key] != undefined) {
      this.items[key].selected = true;
    }
  };

  /**
   * Set or get a selected item
   * @param {string} key set item as selected by his key
   * @returns Return the selected item or nothing on set.
   */
  selected (key = undefined, forceDisabled = false) {
    if (key === undefined) {
      let f = Object.entries(this.items)
        .filter(item => item[1].selected != undefined && item[1].selected);

      let f1 = f[0]?.[1] ?? null;
      if (f1) f1.key = f[0][0];

      return f[0] ?.[1] ?? null;
    }
    else if (key === null) {

      this.options.onReplaceText?.(null, this);
      const $root = $(`#${this.id}`);

      $root.find('input[type=hidden]')
        .data('value', null)
        .prop('data-value', null)
        .val(null)
        .trigger('change');
      $root.data('item-choice', '1');
      this.unselect();
      this.ddInput.value = '';
    }
    else
    {
      return new Promise(resolve => {
        const tryClick = () => {

          const $el = $(`#${this.id} .dropdown-menu [data-value="${key}"]`);

          if ($el.length > 0 && this.#itemsRendered) {
            let isDisabled = $el.prop('disabled');
            if (isDisabled && forceDisabled) $el.prop('disabled', false);

            $el.trigger('click');

            if (isDisabled) $el.prop('disabled', true);

            resolve(true);
            return true;
          }
          return false;
        };

        if (tryClick()) return;

        const onRendered = () => {
          if (tryClick()) {
            this.container.removeEventListener('dropdown-items-rendered', onRendered, true);
          }
        };
        this.container.addEventListener('dropdown-items-rendered', onRendered, true);
      });
    }
  }

  unselect () {
    // eslint-disable-next-line no-unused-vars
    for (const [ idx, item ] of Object.entries(this.items)) {
      item.selected = false;
    }
  }

  #merge () {
    var dst = {}
      , src
      , p
      , args = [].splice.call(arguments, 0)
    ;

    while (args.length > 0) {
      src = args.splice(0, 1)[0];
      if (toString.call(src) == '[object Object]') {
        for (p in src) {
          // eslint-disable-next-line no-prototype-builtins
          if (src.hasOwnProperty(p)) {
            if (toString.call(src[p]) == '[object Object]') {
              dst[p] = this.#merge(dst[p] || {}, src[p]);
            } else {
              dst[p] = src[p];
            }
          }
        }
      }
    }

    return dst;
  }

  // Autofill test
  #selectButton (btn) {
  // Einheitliche Selektion wie in deinem Click-Handler
    this.options.onReplaceText?.({ type: 'click', currentTarget: btn }, this);

    const $root = $(`#${this.id}`);
    const val   = $(btn).data('value');

    $root.find('input[type=hidden]')
      .data('value', val)
      .prop('data-value', val)
      .val(val)
      .trigger('change');

    $root.data('item-choice', '1');
    this.unselect();
    this.#setSelected(val);
    this.options.onSelected?.({ type: 'auto', currentTarget: btn });

    // Menü schließen, optional Fokus auf Input behalten
    this.dd.hide();
  // this.ddInput.focus(); // falls du weiter tippen willst
  }

  #autoSelectIfUnambiguous () {
    const $root = $(`#${this.id}`);
    const $vis  = $root.find('.dropdown-menu li:not(.d-none) > *:not([disabled])');

    if ($vis.length === 1) {
      const btn = $vis[0];
      this.#selectButton(btn);
      return true;
    }
    return false;
  }

}
