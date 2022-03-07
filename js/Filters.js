class Filters {

  constructor(config) {
    let defaults = {
      filtersContainerSelector: '#filters',
      dataSelector: '#data li',
      defaultSelected: true,
      debug: false,
      plugins: {
        'categorical': new CategoricalButtons(),
        'range': new RangeSliders(),
        'categorical-buttons': new CategoricalButtons(),
        'range-selects': new RangeSelects(),
        'range-buttons': new RangeButtons(),
        'range-sliders': new RangeSliders(),
      },
      filters: {}
    }

    this.config = this.deepMerge(defaults, config);
    this.filters = this.config.filters;
    this.plugins = this.config.plugins;

    this.$dataElements = $(config.dataSelector);
    this.$filterContainer = $(config.filtersContainerSelector);
    this.$filterElements = this.$filterContainer.find('fieldset')

    console.assert(this.$dataElements.length, 'Filters(): no data elements found');
    console.assert(this.$filterContainer.length, 'Filters(): no filter container found');
    console.assert(this.$filterElements.length, 'Filters(): no filter elements found');

    this.registerFilters();
    this.filterConfigFromHtml();

    this.debug('Plugins registered:');
    this.debug(this.plugins);
    this.debug('Filter configuration:');
    this.debug(this.filters);

    let values = this.collectFilterValues();
    this.buildFilters(values);
    this.filter();
  }

  registerFilters() {
    Object.values(this.plugins).forEach((plugin) => {
      plugin.filtersInstance = this;
    });
  }

  filterConfigFromHtml() {
    let instance = this;
    let filters = {}
    this.$filterElements.each(function(i) {
      let $fieldset = $(this);
      let property = $fieldset.data('filter-property');
      let type = $fieldset.data('filter-type');
      let dataType = $fieldset.data('filter-data-type');
      let maxValues = $fieldset.data('filter-max-values');
      let filter = {};
      if (type) filter.type = type;
      if (dataType) filter.dataType = dataType;
      if (maxValues) filter.maxValues = maxValues;
      filters[property] = filter;
    });
    this.filters = this.deepMerge(this.filters, filters);
  }

  collectFilterValues() {
    return this.collectUniqueValues(this.$dataElements, true);
  }

  collectAvailableValues() {
    return this.collectUniqueValues(this.$dataElements.filter('[data-filter-selected]'), false);
  }

  collectUniqueValues($elements, allowConfigCopy) {
    let values = {};
    Object.entries(this.filters).forEach(([property, filter]) => {
      values[property] = this.collectUniquePropertyValues($elements, property, filter, allowConfigCopy);
    });
    return values;
  }

  collectUniquePropertyValues($elements, property, filter, allowConfigCopy) {
    let values = [];
    $elements.each(function(element) {
      values.push($(this).data(property));
    });
    if (filter.dataType === 'integer') values.sort((a,b) => a - b)
    else values.sort();
    if (allowConfigCopy && filter.values) values = filter.values.concat(values);
    values = this.unique(values);
    return values;
  }

  buildFilters(values) {
    this.debug('Filters.buildFilters values');
    this.debug(values);
    Object.entries(this.filters).forEach(([property, filter]) => {
      this.buildFilter(property, filter, values[property]);
    });
  }

  buildFilter(property, filter, values) {
    let $filter = this.getFilter(property, filter);
    if (filter.type in this.plugins)
      try {
        return this.plugins[filter.type].build(property, values, filter, $filter);
      } catch(err) {
        console.error(`Filters.buildFilter: ${filter.type} for ${property}: ${err}`)
      }
    console.error(`Filters.buildFilter: Unknown filter type ${filter.type} for ${property}`)
  }

  collectConditions() {
    let instance = this;
    let conditions = {};
    Object.entries(this.filters).forEach(([property, filter]) => {
      let condition = this.collectCondition(property, filter);
      if (condition) conditions[property] = condition;
    });
    return conditions;
  }

  collectCondition(property, filter) {
    let $filter = this.getFilter(property, filter);
    if (filter.type in this.plugins)
      try {
        return this.plugins[filter.type].collectCondition(property, filter, $filter);
      } catch(err) {
        console.error(`Filters.buildFilter: ${filter.type} for ${property}: ${err}`)
      }
    console.error(`Filters.collectCondition: Unknown condition type ${filter.type} for ${property}`)
  }

  filter() {
    let instance = this;
    let conditions = this.collectConditions();
    let defaultSelected = this.config.defaultSelected ? true : Object.keys(conditions) ? false : true;
    this.debug('conditions');
    this.debug(conditions);
    this.$dataElements.each(function() {
      instance.filterElements($(this), conditions, defaultSelected, instance);
    });
    this.disableUnavailables();
  }

  filterElements($elem, conditions, defaultSelected, instance) {
    let selected = defaultSelected;
    Object.entries(conditions).forEach(([property, condition]) => {
      selected &&= instance.filterProperty(property, $elem, condition);
    });
    instance.setRemoveAttr($elem, 'data-filter-selected', selected);
  }

  filterProperty(property, $elem, filter) {
    let value = $elem.data(property);
    if (Array.isArray(filter) && !(filter.includes(value)))
      return false;
    else if (typeof filter === 'object' ) {
      if (filter.min && value < filter.min) return false;
      if (filter.max && value > filter.max) return false;
    }
    return true;
  }

  disableUnavailables() {
    let values = this.collectAvailableValues();
    this.debug('availables');
    this.debug(values)
    Object.entries(this.filters).forEach(([property, filter]) => {
      this.disableUnavailable(property, filter, values[property]);
    });
  }

  disableUnavailable(property, filter, values) {
    let $filter = this.getFilter(property, filter);
    try {
      if (filter.type in this.plugins)
        return this.plugins[filter.type].disableUnavailable(property, values, filter, $filter);
    } catch (e) {
      console.error(`Filters.disableUnavailabe: Error on filter ${filter} for ${property}: ${e}`);
    }
    console.error(`Filters.disableUnavailabe: Unknown filter type ${filter.type} for ${property}`);
  }

  getFilter(property, filter) {
    if (!filter)
      return this.$filterContainer.find('[data-filter-property=' + property + ']');
    return this.$filterContainer.find('[data-filter-property=' + property + '][data-filter-type=' + filter.type + ']');
  }

  selectWithEqualDistance(values, number) {
    console.assert(number, 'Filter.selectWithEqualDistance: intervals is not defined');
    if (number > values.length) number = values.length;
    let step = (values.length - 1) / (number - 1);
    let selected = [];
    for (let i = 0. ; i < values.length ; i+=step)
      selected.push(values[Math.round(i)])
    console.assert(selected[0] == values[0], `First values do not match ${selected[0]} != ${values[0]}`)
    console.assert(this.last(selected) == this.last(values), `Last values do not match ${this.last(selected)} != ${this.last(values)}`)
    console.assert(selected.length == number, `Selected ${selected.length} values does not equal ${number}`)
    return selected;
  }

  unique(values) {
    return values.filter((v, i, a) => a.indexOf(v) === i);
  }

  last(values) {
    return values[values.length-1];
  }

  toggleAttr($elem, attr, val) {
    if ($elem.attr(attr)) $elem.removeAttr(attr)
    else $elem.attr(attr, val)
  }

  setRemoveAttr($elem, attr, val) {
    if (!val) $elem.removeAttr(attr)
    else $elem.attr(attr, val)
  }

  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    return this.deepMerge(target, ...sources);
  }

  debug(msg) {
    if (this.config.debug) console.log(msg);
  }

}
