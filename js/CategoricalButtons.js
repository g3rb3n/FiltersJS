/* jshint esversion: 6 */

class CategoricalButtons extends Plugin {

	constructor() {
		super();
	}

	filterConfigFromHtml(property, filter, $filter) {
		if ($filter.data('filter-data-type')) filter.dataType = $filter.data('filter-data-type');
		return filter;
	}

	buildContainerHtml(property, filter, $filter) {
		$('<fieldset>').attr('data-filter-property', property).attr('data-filter-type', filter.type).appendTo($filter);
	}

	buildValuesHtml(property, values, filter, $filter){
		let filters = this.filtersInstance;
		let self = this;
		console.assert($filter.length, `CategoricalButtons.buildValuesHtml: Could not find ${property}`);
		$filter.empty();
		values.forEach(function(value) {
			$('<button>')
				.text(value)
				.attr('value',value)
				.appendTo($filter)
				.click(e => self.valueButtonOnClick(filters, $(e.target)));
		});
	}

	valueButtonOnClick(filters, $button) {
		$('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
		$button.parent('fieldset').attr('data-filter-last-clicked', true);
		filters.toggleAttr($button, 'data-filter-selected', 'selected');
		filters.filter();
	}

	collectCondition(property, filter, $filter){
		let condition = [];
		$filter.find('button[data-filter-selected]').each(function(i){
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
		let $buttons = $filter.find('button');
		console.assert($buttons.length, `CategoricalButtons.disableUnavailabe: Could not find ${property}`);
		$buttons.each((i,button) => {
			let $button = $(button);
			let value = $button.val();
			if (filter.dataType === 'integer')
				value = parseInt(value);
			instance.debug(`CategoricalButtons: disable ${property} ${value} ${!available.includes(value)}`);
			instance.setRemoveAttr($button, 'data-filter-disabled', !available.includes(value));
		});
	}

}
