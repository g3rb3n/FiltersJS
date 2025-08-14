/* jshint esversion: 6 */

class CategoricalOneChoiceButtons extends CategoricalButtons {

	constructor() {
		super();
	}

	valueButtonOnClick(filters, $button) {
		let $fs = $button.parent('fieldset');
		$('[data-filter-last-clicked]').removeAttr('data-filter-last-clicked');
		$button.parent('fieldset').attr('data-filter-last-clicked', true);
		$fs.find('button').removeAttr('data-filter-selected');
		$button.attr('data-filter-selected', 'selected');
		filters.filter();
	}

}
