
import { set, get } from '@ember/object';
import { isNone } from '@ember/utils';
import { isArray } from '@ember/array';

function addQueryStringPair(params, key, value) {
	if (/\[.+\]/.test(key)) { // parse type: `key[subkey]=value`
		let [ normalizeKey, subKey ] = key.split('[');
		subKey = subKey.split(']').join('');
		let obj = get(params, normalizeKey) || {};

		// NOTE:
		// for keys formatted like `key[subkey][]=value`
		// the key will be parsed correctly in that
		// at this part of the code we will have `subkey[]=value`
		// therefore recursively calling addQueryStringPair will parse
		// this in the following `else if` statment
		addQueryStringPair(obj, subKey, value);

		// after recursively calling addQueryStringPair
		// then the new obj can be added to the original params
		set(params, normalizeKey, obj);
	} else if (/\[\]$/.test(key)) { // parse type: `key[]=value`
		let normalizeKey = key.substring(key.length - 2, 0);
		let arr = get(params, normalizeKey) || [];
		arr.push(value);
		addQueryStringPair(params, normalizeKey, arr);
	} else {
		// normal key pair just add to params
		set(params, key, typeCast(value));
	}
}

function typeCast(value) {
	if (/^[.][\d]+/.test(value)) {
		return typeCast(0 + value);
	}

	if (value === '') {
		return null;
	} else if (value === 'true') {
		return true;
	} else if (value === 'false') {
		return false;
	} else if (/[\d]+[.]?[\d]*/.test(value)) {
		let val = parseInt(value, 10);
		if (`${val}` === value) {
			return val;
		} else {
			val = parseFloat(value);
			if (`${val}` === value) {
				return val;
			}
		}
	}
	return value;
}

export default {
	stringify(query) {
		let queryStr = '';
		Object.keys(query).forEach(key => {
			let value = get(query, key);
			if (value !== undefined) {
				if (isArray(value)) {
					value.forEach(val => queryStr += `&${key}[]=${val}`);
				} else if (!isNone(value) && typeof value === 'object') {
					let subStr = this.stringify(value);
					queryStr += '&' + subStr.replace(/^([^=]*)/, key + '[$1]').replace(/&([^=]*)/g, '&' + key + '[$1]');
				} else {
					if (value === null) {
						value = '';
					}
					queryStr += `&${key}=${value}`;
				}
			}
		});
		return queryStr.replace(/^&/, '');
	},

	parse(query) {
		let data = {};
		if (query && query.length) {
			const params = query.split('&');
			params.forEach(item => {
				const [ key, value ] = item.split('=');
				addQueryStringPair(data, key, value);
			});
		}
		return data;
	}
}
