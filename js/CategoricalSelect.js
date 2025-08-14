/* jshint esversion: 6 */

class CategoricalSelect extends Plugin {

	constructor() {
		super();
	}

	filterConfigFromHtml(property, filter, $filter) {
		if ($filter.data('filter-data-type')) filter.dataType = $filter.data('filter-data-type');
		return filter;
	}

	buildContainerHtml(property, filter, $filter) {
		let $fs = $('<fieldset>')
			.attr('data-filter-property', property)
			.attr('data-filter-type', filter.type)
			.appendTo($filter);
		$('<select>')
			.attr('name', `${property}`)
			.attr('multiple', 'multiple')
			.attr('size', filter.size)
			.appendTo($fs);
	}

	buildValuesHtml(property, values, filter, $filter){
		let filters = this.filtersInstance;
		let self = this;
		$filter = $filter.find('select');
		console.assert($filter.length, `CategoricalSelect.buildValuesHtml: Could not find ${property}`);
		$filter.empty();
		values.forEach(function(value) {
			$('<option>')
				.text(value)
				.attr('value',value)
				.appendTo($filter)
				.click(e => self.valueClicked(filters, $(e.target)));
		});
	}

	valueClicked(filters, $option) {
		$('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
		$option.parent('fieldset').attr('data-filter-last-clicked', true);
		filters.toggleAttr($option, 'data-filter-selected', 'selected');
		filters.filter();
	}

	collectCondition(property, filter, $filter){
		let condition = [];
		$filter.find('option[data-filter-selected]').each(function(i){
			let value = $(this).val();
			if (filter.dataType === 'integer')
				value = parseInt(value);
			condition.push(value);
		});
		if (condition.length)
			return condition;
		return;
	}

	disableUnavailable(property, available, filter, $filter){
		let instance = this.filtersInstance;
		let $options = $filter.find('option');
		console.assert($options.length, `CategoricalSelect.disableUnavailabe: Could not find ${property}`);
		$options.each((i,option) => {
			let $option = $(option);
			let value = $option.val();
			if (filter.dataType === 'integer')
				value = parseInt(value);
			instance.debug(`CategoricalSelect: disable ${property} ${value} ${!available.includes(value)}`);
			instance.setRemoveAttr($option, 'data-filter-disabled', !available.includes(value));
		});
	}

}
