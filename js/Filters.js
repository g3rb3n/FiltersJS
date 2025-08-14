/* jshint esversion: 6 */

class Filters {

	constructor(config) {
		let defaults = {
			filtersContainerSelector: '#filters',
			dataSelector: '#data li',
			andComparison: true,
			debug: false,
			dataContentsSelector: false,
			filterEmptyValues: true,
			selectedProperty: 'data-filter-selected',
			buildContainers: false,
			filterContainerElement: 'div',
			filterLabelElement: 'h2',
			plugins: {
				'categorical': new CategoricalButtons(),
				'range': new RangeSliders(),
			},
			filters: {}
		};

		this.config = this.deepMerge(defaults, config);
		this.debug('Config:');
		this.debug(this.config);

		this.$filterContainer = $(config.filtersContainerSelector);
		console.assert(this.$filterContainer.length, 'Filters(): no filter container found');
		this.config.buildContainers = this.$filterContainer.children().length == 0;

		this.plugins = this.config.plugins;
		this.registerInstanceAtPlugins();
		this.debug('Plugins registered:');
		this.debug(this.plugins);

		this.filters = this.config.filters;
		Object.values(this.filters).forEach((filter) => console.log(filter));
		Object.values(this.filters).forEach((filter) => filter.type = filter.type || 'categorical');
		this.debug('Filter configuration:');
		this.debug(this.filters);

		this.$filterElements = this.$filterContainer.find('fieldset');
		if (this.config.buildContainers) this.buildContainersHtml();
		else this.filtersConfigFromHtml();
		this.$filterElements = this.$filterContainer.find('fieldset');
		console.assert(this.$filterElements.length, 'Filters(): no filter elements found');
		this.debug('Filter elements:');
		this.debug(this.$filterElements);

		this.$dataElements = $(config.dataSelector);
		console.assert(this.$dataElements.length, 'Filters(): no data elements found');
		this.debug('Data found:');
		this.debug(this.$dataElements);

		let values = this.collectFilterValues();
		this.buildFiltersValuesHtml(values);
		this.filter();
	}

	registerInstanceAtPlugins() {
		Object.values(this.plugins).forEach((plugin) => {
			plugin.filtersInstance = this;
		});
	}

	filtersConfigFromHtml() {
		let instance = this;
		let filters = {};
		this.$filterElements.each(function(i, filterElement) {
			let filter = {};
			let $filter = $(filterElement);
			let property = $filter.data('filter-property');
			filters[property] = instance.filterConfigFromHtml(property, filter, $filter);
		});
		this.filters = this.deepMerge(this.filters, filters);
	}

	filterConfigFromHtml(property, filter, $filter) {
		let instance = this;
		let config = {
			type: $filter.data('filter-type')
		};
		let plugin = instance.getPlugin(property, config);
		return plugin.filterConfigFromHtml(property, config, $filter);
	}

	collectFilterValues() {
		return this.collectUniqueValues(this.$dataElements, true);
	}

	collectAvailableValues() {
		return this.collectUniqueValues(this.$dataElements.filter(`[${this.config.selectedProperty}]`), false);
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
		if (this.config.filterEmptyValues) values = values.filter(e => e);
		if (filter.dataType === 'integer') values.sort((a,b) => a - b);
		else values.sort();
		if (allowConfigCopy && filter.values) values = filter.values.concat(values);
		values = this.unique(values);
		return values;
	}

	buildContainersHtml() {
			this.debug('Filters.buildContainersHtml');
			Object.entries(this.filters).forEach(([property, filter]) => {
				this.buildContainerHtml(property, filter);
			});
	}

	buildContainerHtml(property, filter) {
		let $filter = $(`<${this.config.filterContainerElement}>`).appendTo(this.$filterContainer);
		let label = filter.label || property;
		$(`<${this.config.filterLabelElement}>`).html(label).appendTo($filter);
		let plugin = this.getPlugin(property, filter);
		try {
		  return plugin.buildContainerHtml(property, filter, $filter);
		} catch(err) {
			console.error(`Filters.buildContainerHtml: ${filter.type} for ${property}: ${err}`);
		}
	}

	buildFiltersValuesHtml(values) {
		this.debug('Filters.buildFiltersValuesHtml values');
		this.debug(values);
		Object.entries(this.filters).forEach(([property, filter]) => {
			this.buildFilterValuesHtml(property, filter, values[property]);
		});
	}

	buildFilterValuesHtml(property, filter, values) {
		let $filter = this.getFilter(property, filter);
		let plugin = this.getPlugin(property, filter);
		try {
		  return plugin.buildValuesHtml(property, values, filter, $filter);
		} catch(err) {
			console.error(`Filters.buildFilterValuesHtml: ${filter.type} for ${property}: ${err}`);
		}
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
		let plugin = this.getPlugin(property, filter);
		try {
		  return plugin.collectCondition(property, filter, $filter);
		} catch(err) {
			console.error(`Filters.collectCondition: ${filter.type} for ${property}: ${err}`);
		}
	}

	filter() {
		let instance = this;
		let conditions = this.collectConditions();
		//let defaultSelected = this.config.defaultSelected ? true : Object.keys(conditions) ? false : true;
		this.debug('conditions');
		this.debug(conditions);
		this.$dataElements.each(function() {
			instance.filterElements($(this), conditions, instance.config.andComparison, instance);
		});
		this.disableUnavailables();
	}

	filterElements($elem, conditions, andComparison, instance) {
		let selected = andComparison;
		Object.entries(conditions).forEach(([property, condition]) => {
			if (andComparison)
				selected = selected && instance.filterProperty(property, $elem, condition);
			else
				selected = selected || instance.filterProperty(property, $elem, condition);
		});
		instance.setRemoveAttr($elem, this.config.selectedProperty, selected);
	}

	filterProperty(property, $elem, filter) {
		let value = $elem.data(property);
		if (Array.isArray(filter) && !(filter.includes(value)))
			return false;
		else if (typeof filter === 'object') {
			if (filter.min && value < filter.min) return false;
			if (filter.max && value > filter.max) return false;
		}
		return true;
	}

	disableUnavailables() {
		let values = this.collectAvailableValues();
		this.debug('availables');
		this.debug(values);
		Object.entries(this.filters).forEach(([property, filter]) => {
			this.disableUnavailable(property, filter, values[property]);
		});
	}

	disableUnavailable(property, filter, values) {
		let $filter = this.getFilter(property, filter);
		let plugin = this.getPlugin(property, filter);
		try {
		  return plugin.disableUnavailable(property, values, filter, $filter);
		} catch (e) {
			console.error(`Filters.disableUnavailabe: Error on filter ${filter} for ${property}: ${e}`);
		}
	}

	getFilter(property, filter) {
		if (!filter)
			return this.$filterContainer.find('[data-filter-property=' + property + ']');
		return this.$filterContainer.find('[data-filter-property=' + property + '][data-filter-type=' + filter.type + ']');
	}

	getPlugin(property, filter) {
		if (!(filter.type in this.plugins))
			console.error(`Filters.getPlugin: Unknown filter type ${filter.type} for ${property}`);
		return this.plugins[filter.type];
	}

	selectWithEqualDistance(values, number) {
		console.assert(number, 'Filter.selectWithEqualDistance: intervals is not defined');
		if (number > values.length) number = values.length;
		let step = (values.length - 1) / (number - 1);
		let selected = [];
		for (let i = 0.0 ; i < values.length ; i+=step)
			selected.push(values[Math.round(i)]);
		console.assert(selected[0] == values[0], `First values do not match ${selected[0]} != ${values[0]}`);
		console.assert(this.last(selected) == this.last(values), `Last values do not match ${this.last(selected)} != ${this.last(values)}`);
		console.assert(selected.length == number, `Selected ${selected.length} values does not equal ${number}`);
		return selected;
	}

	unique(values) {
		return values.filter((v, i, a) => a.indexOf(v) === i);
	}

	last(values) {
		return values[values.length-1];
	}

	toggleAttr($elem, attr, val) {
		if ($elem.attr(attr)) $elem.removeAttr(attr);
		else $elem.attr(attr, val);
	}

	setRemoveAttr($elem, attr, val) {
		if (!val) $elem.removeAttr(attr);
		else $elem.attr(attr, val);
	}

	isObject(item) {
		return (item && typeof item === 'object' && !Array.isArray(item));
	}

	deepMerge(target, ...sources) {
		if (!sources.length) return target;
		const source = sources.shift();

		if (this.isObject(target) && this.isObject(source)) {
			for (const key in source) {
				if (this.isObject(source[key]) && !(source[key] instanceof Plugin)) {
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
