/**
 * @module collections
 *
 */
import Ember from 'ember';

/**
 * `Collection\Collection`
 *
 */
export default Ember.ArrayProxy.extend(Ember.Evented,
{
	content: null,

	store: null,

	manager: null,

	isLoading: false,
	isUpdating: false,

	update: function()
	{
		this.set('isUpdating', true);

		var _this = this;
		this.manager.update().then(function()
		{
			_this.set('isUpdating', false);
		});
	},

	buildModels: function(data)
	{
		return data;
	},

	populateModels: function(data)
	{
		this.set('isLoading', true);

		var models = this.buildModels(data);

		if(!Ember.isNone(models.forEach))
		{
			models.forEach(function(model)
			{
				this.addInternalModel(model);
			}, this);
		}
		else
		{
			this.set('model', models);
		}

		this.set('isLoading', false);

		return this;
	},

	objectAtContent: function(index)
	{
		var content = Ember.get(this, 'content');

		return content.objectAt(index);
	},

	addInternalModel: function(model, idx)
	{
		if(idx !== undefined)
		{
			this.get('content').removeAt(idx, 1);
			this.get('content').insertAt(idx, model);
		}
		else
		{
			this.get('content').pushObject(model);
		}

		return this;
	},

	removeInternalModel: function(model)
	{
		this.get('content').removeObject(model);
		return this;
	},
});