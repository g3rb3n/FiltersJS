let config = {
	debug: false,
	filtersContainerSelector: '#filters',
	dataSelector: '#data li',
}

describe('filters', function () {
	it('should initialize', function () {
		let filters = new Filters(config);
		chai.expect(Object.keys(filters.filters).length).to.equal(3);
		chai.expect(filters.$dataElements.length).to.equal(5);
		chai.expect(filters.$filterElements.length).to.equal(3);
	});

	it('should find values', function () {
		let filters = new Filters(config);
		let values = filters.collectFilterValues();
		chai.expect(Object.keys(values).length).to.equal(3);
		chai.expect(values.price.length).to.equal(5);
		chai.expect(values.model.length).to.equal(3);
		chai.expect(values.size.length).to.equal(3);
	});

	it('should select with equal distance', function () {
		let values = [1,2,3,4,5,6,7,8,9]
		let filters = new Filters(config);
		let selected = filters.selectWithEqualDistance(values, 3);
		chai.expect(selected).to.eql([1,5,9]);
	});

	it('should modify available data and filters', function () {
		let filters = new Filters(config);
		$('[value=m121]').click();
		let values = filters.collectAvailableValues();
		let selected = $('#data [data-filter-selected]');
		let disabledModels = $('#filters [data-filter-property=model] [data-filter-disabled]');
		let disabledSizes = $('#filters [data-filter-property=size] [data-filter-disabled]');
		chai.expect(Object.keys(values).length).to.equal(3);
		chai.expect(values.price.length).to.equal(2);
		chai.expect(values.model.length).to.equal(1);
		chai.expect(values.size.length).to.equal(2);
		chai.expect(selected.length).to.equal(2);
		chai.expect(disabledModels.length).to.equal(2);
		chai.expect(disabledSizes.length).to.equal(1);
	});

});
