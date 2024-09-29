class CatalogGenerator {
  constructor({
    container,
    noteNameForSort = "Название",
    sortFields = [],
    columns = [],
    filters = {},
    catalogPropertyName = "Категория",
    visibleFilterLimit = 0,
    labelMode = "line",
    noCovers = false,
  } = {}) {
    this.container = container;
    this.noteNameForSort = noteNameForSort;
    this.sortFields = [noteNameForSort, ...sortFields];
    this.columns = columns;
    this.filters = filters;
    this.catalogPropertyName = catalogPropertyName;
    this.visibleFilterLimit = visibleFilterLimit;
    this.labelMode = labelMode;
    this.noCovers = noCovers;

    this.currentNotePath = dv.current().file.path;
    this.filtersEl = this.container.createEl("div", {
      cls: "db-cards-list-filters",
    });

    this.gridEl = this.container.createEl("div", {
      cls: "db-cards-list-items",
    });

    this.generateCounters();
    this.generateFilters();
    this.generateSortRow();

    // Инициализация запроса через установку первоначальной сортировки
    this.sortingBlockBody.querySelector("input").click();
  }

  /**
   * Генерация счётчика записей и элемента сброса фильтров
   */
  generateCounters() {
    this.filtersEl.createEl("span", {
      cls: "db-cards-list__filter-caption",
      text: "Заметок: ",
    });

    this.countersBlockBody = this.filtersEl.createEl("div", {
      cls: "db-cards-list__filter-body",
    });

    const countersValueBlock = this.countersBlockBody.createEl("span", {
      cls: "db-cards-list-counters__total",
    });

    this.countersFilteredBlockValue = countersValueBlock.createEl("span", {
      text: "",
    });

    this.countersTotalBlockValue = countersValueBlock.createEl("span", {
      text: "0",
    });

    this.resetFiltersButton = this.countersBlockBody.createEl("button", {
      cls: "db-cards-list-button",
      text: "Сбросить фильтры",
    });

    this.resetFiltersButton.onclick = () => {
      this.getFiltersEls().forEach((item) => {
        item.checked = false;
      });

      this.updateGrid();
    };

    this.filtersEl.createEl("div", {
      cls: "db-cards-list__filter-divider",
    });
  }

  /**
   * Генерация кнопки сворачивания фильтров
   * @param {Object} parentBlock
   */
  generateExpandFiltersButton(parentBlock) {
    this.filtersExpanded = true;

    this.expandFiltersButton = parentBlock.createEl("button", {
      cls: "db-cards-list-button",
    });

    this.expandFiltersButton.onclick = () => {
      this.filtersExpanded = !this.filtersExpanded;

      this.expandFiltersButton.textContent =
        (this.filtersExpanded ? "Свернуть" : "Развернуть") + " фильтры ⇅";

      if (this.filtersExpanded) {
        this.filterBlocks.forEach((item) => {
          item.style.display = null;
          item.previousSibling.style.display = null;
        });

        this.filtersDivider.style.display = null;
      } else {
        this.filterBlocks.slice(this.visibleFilterLimit).forEach((item) => {
          item.style.display = "none";
          item.previousSibling.style.display = "none";
        });

        if (this.visibleFilterLimit === 0) {
          this.filtersDivider.style.display = "none";
        }
      }
    };
  }

  /**
   * Обновление значений счётчика записей
   * @param {Number} totalCount
   * @param {Number} filteredCount
   * @param {Object} filterValues
   */
  updateCounters(totalCount, filteredCount, filterValues) {
    this.countersTotalBlockValue.textContent = totalCount;

    if (Object.keys(filterValues).length) {
      this.countersFilteredBlockValue.textContent = `${filteredCount} из `;
      this.resetFiltersButton.style.display = "inline-block";
    } else {
      this.countersFilteredBlockValue.textContent = "";
      this.resetFiltersButton.style.display = "none";
    }
  }

  /**
   * Генерация элементов сортировки
   */
  generateSortRow() {
    const sortDirections = {
      ASC: "↑",
      DESC: "↓",
    };

    this.filtersEl.createEl("span", {
      cls: "db-cards-list__filter-caption",
      text: "Сортировка: ",
    });

    this.sortingBlockBody = this.filtersEl.createEl("div", {
      cls: "db-cards-list__filter-body",
    });

    this.sortFields.forEach((field) => {
      Object.entries(sortDirections).forEach(([direction, symbol]) => {
        const value = `${field}_${direction}`;
        const text = `${field} ${symbol}`;
        const element = this.generateFilterItem(
          "Сортировка",
          value,
          "radio",
          text
        );

        this.sortingBlockBody.appendChild(element);
      });
    });
  }

  /**
   * Генерация элементов фильтрации
   */
  generateFilters() {
    this.filterBlocks = [];

    Object.keys(this.filters).forEach((propertyName) => {
      const sortedAttributes = this.attributesList(propertyName).sort(
        (a, b) => {
          if (a === null || b === null) {
            return a === null ? -1 : 1;
          }

          if (typeof a === "boolean" && typeof b === "boolean") {
            return b - a;
          }
          return a > b ? 1 : a < b ? -1 : 0;
        }
      );

      const filterBlock = this.generateFilterRow(
        sortedAttributes,
        propertyName,
        "checkbox"
      );

      this.filterBlocks.push(filterBlock);
    });

    if (this.filterBlocks.length) {
      this.filtersDivider = this.filterBlocks[0].parentNode.createEl("div", {
        cls: "db-cards-list__filter-divider",
      });
    }

    if (
      (this.visibleFilterLimit > 0 &&
        this.filterBlocks.length > this.visibleFilterLimit) ||
      (this.visibleFilterLimit === 0 && this.filterBlocks.length)
    ) {
      this.generateExpandFiltersButton(this.countersBlockBody);
      this.expandFiltersButton.click();
    }
  }

  /**
   * Генерация фильтра для свойства
   * @param {Array} items
   * @param {String} labelName
   * @param {String} inputType
   * @returns Object
   */
  generateFilterRow(items, inputName, inputType) {
    this.filtersEl.createEl("span", {
      cls: "db-cards-list__filter-caption",
      text: `${inputName}:`,
    });

    const filterBlockBody = this.filtersEl.createEl("div", {
      cls: "db-cards-list__filter-body",
    });

    items.forEach((item) => {
      let labelName = item;

      if (item === null) {
        labelName = "Не указано";
      } else if (typeof item == "boolean") {
        labelName = item ? "Да" : "Нет";
      }

      const element = this.generateFilterItem(
        inputName,
        item,
        inputType,
        labelName
      );
      filterBlockBody.appendChild(element);
    });

    return filterBlockBody;
  }

  /**
   * Генерация элемента выбора (переключателя)
   * @param {String} inputName
   * @param {String} value
   * @param {String} inputType
   * @param {String} labelName
   * @returns Object
   */
  generateFilterItem(inputName, value, inputType, labelName) {
    const label = document.createElement("label");
    const labelText = document.createElement("span");

    labelText.appendChild(document.createTextNode(labelName));

    const opt = document.createElement("input");
    opt.type = inputType;
    opt.value = value;
    opt.name = inputName;
    opt.onchange = () => this.updateGrid();

    label.appendChild(opt);
    label.appendChild(labelText);

    return label;
  }

  /**
   * Получение списка уникальных значений атрибута
   * @param {*} attributeKey
   * @returns Array
   */
  attributesList(attributeKey) {
    const result = this.catalogList()
      .array()
      .map((page) => page[attributeKey])
      .filter((attributeList) => attributeList !== undefined)
      .flatMap((attributeList) =>
        Array.isArray(attributeList) ? attributeList : [attributeList]
      );

    return [...new Set(result)];
  }

  /**
   * Получение списка записей без фильтрации
   * @returns Array
   */
  catalogList() {
    return dv
      .pages('-"Шаблоны"')
      .where(
        (p) =>
          p[this.catalogPropertyName] !== undefined &&
          Array.isArray(p[this.catalogPropertyName]) &&
          p[this.catalogPropertyName].some(
            (link) => link.path === this.currentNotePath
          )
      );
  }

  /**
   * Получение списка установленных фильтров
   * @returns Object
   */
  getFilters() {
    const result = {};

    this.getFiltersEls().forEach((input) => {
      if (!result[input.name]) {
        result[input.name] = [];
      }

      result[input.name].push(input.value);
    });

    return result;
  }

  /**
   * Получение элементов фильтров с установленными значениями
   * @returns Array
   */
  getFiltersEls() {
    const result = [];

    this.filterBlocks.forEach((block) => {
      const filters = block.querySelectorAll("input:checked");

      filters.forEach((input) => {
        result.push(input);
      });
    });

    return result;
  }

  /**
   * Генерация списка заметок
   */
  async updateGrid() {
    const sortBy = this.sortingBlockBody.querySelector("input:checked");

    const [sortField, sortDirection] = sortBy.value.split("_");

    const list = this.catalogList();
    const totalCount = list.length;
    const filterValues = this.getFilters();

    const pages = list
      .where((p) => {
        for (const property in filterValues) {
          if (filterValues[property].length) {
            if (
              (filterValues[property][0] === "" && p[property] === null) ||
              (filterValues[property].includes("true") &&
                p[property] === true) ||
              (filterValues[property].includes("false") &&
                p[property] === false)
            ) {
              return true;
            }

            if (
              !p[property] ||
              (this.filters[property] === "and"
                ? !filterValues[property].every((value) =>
                    Array.isArray(p[property])
                      ? p[property].includes(value)
                      : p[property] === value
                  )
                : !filterValues[property].some((value) =>
                    Array.isArray(p[property])
                      ? p[property].includes(value)
                      : p[property] === value
                  ))
            ) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((p) => {
        if (sortField === this.noteNameForSort) {
          return p.file.name;
        } else {
          return p[sortField];
        }
      }, sortDirection.toLowerCase());

    const filteredCount = pages.length;

    this.updateCounters(totalCount, filteredCount, filterValues);
    this.renderGrid(pages);
  }

  /**
   * Генерация сетки элементов
   * @param {Array} items
   */
  renderGrid(items) {
    this.gridEl.innerHTML = "";

    items.forEach((item) => {
      const itemEl = this.gridEl.createEl("div", {
        cls: `db-cards-list-item db-cards-list-item-mode-${this.labelMode}`,
      });

      if (!this.noCovers) {
        if (item.cover) {
          itemEl.createEl("img", {
            cls: "db-cards-list-item__cover",
            attr: {
              src: app.vault.getResourcePath(dv.fileLink(item.cover.path)),
            },
          });
        } else {
          itemEl.createEl("div", {
            cls: "db-cards-list-item__cover",
          });
        }
      }
      
      itemEl.createEl("a", {
        cls: "db-cards-list-item__tittle internal-link",
        text: item.file.name,
        attr: {
          href: item.file.link.path,
        },
      });

      this.columns.forEach((columnName) => {
        const propContainer =
          this.labelMode !== "line"
            ? itemEl
            : itemEl.createEl("div", {
                cls: "db-cards-list-item__line",
              });

        let columnLabel = columnName;
        let columnValue = Array.isArray(item[columnName])
          ? item[columnName].join(", ")
          : item[columnName];

        if (columnValue === null) {
          columnValue = "-";
        }

        if (typeof item[columnName] === "boolean") {
          columnLabel = columnName;

          if (this.labelMode !== "hidden") {
            columnValue = item[columnName] ? "✓" : "-";
          } else {
            columnValue = columnValue ? columnName : "-";
          }
        }

        if (this.labelMode !== "hidden") {
          propContainer.createEl("div", {
            cls: "db-cards-list-item__label",
            text: columnLabel,
          });
        }

        propContainer.createEl("div", {
          cls: "db-cards-list-item__value",
          text: columnValue,
          attr: {
            title: this.labelMode === "hidden" ? columnLabel : null,
          },
        });
      });
    });
  }
}

new CatalogGenerator(catalogGeneratorOptions);
