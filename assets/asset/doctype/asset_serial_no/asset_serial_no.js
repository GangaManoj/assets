// Copyright (c) 2021, Ganga Manoj and contributors
// For license information, please see license.txt

frappe.ui.form.on('Asset Serial No', {
	onload: function(frm) {
		frm.set_query('asset', function() {
			return {
				'filters': {
					'is_serialized_asset': 1
				}
			};
		});
	},

	refresh: function(frm) {
		frm.trigger('toggle_depreciation_fields');
	},

	asset: (frm) => {
		frm.trigger('toggle_depreciation_fields');
	},

	toggle_depreciation_fields: (frm) => {
		if (frm.doc.asset) {
			frappe.db.get_value('Asset_', frm.doc.asset, ['calculate_depreciation', 'is_existing_asset'], (r) => {
				if (r && r.calculate_depreciation) {
					frm.set_df_property('available_for_use_date', 'hidden', 0);
					frm.set_df_property('depreciation_posting_start_date', 'hidden', 0);
					frm.set_df_property('salvage_value', 'hidden', 0);
					frm.set_df_property('finance_books', 'hidden', 0);

					frm.toggle_reqd('available_for_use_date', 1);
					frm.toggle_reqd('depreciation_posting_start_date', 1);
					frm.toggle_reqd('salvage_value', 1);
					frm.toggle_reqd('finance_books', 1);

					if (r.is_existing_asset) {
						frm.set_df_property('opening_accumulated_depreciation', 'hidden', 0);
					} else {
						frm.set_df_property('opening_accumulated_depreciation', 'hidden', 1);
					}
				}
				else {
					frm.set_df_property('available_for_use_date', 'hidden', 1);
					frm.set_df_property('depreciation_posting_start_date', 'hidden', 1);
					frm.set_df_property('opening_accumulated_depreciation', 'hidden', 1);
					frm.set_df_property('salvage_value', 'hidden', 1);
					frm.set_df_property('finance_books', 'hidden', 1);

					frm.toggle_reqd('available_for_use_date', 0);
					frm.toggle_reqd('depreciation_posting_start_date', 0);
					frm.toggle_reqd('salvage_value', 0);
					frm.toggle_reqd('finance_books', 0);
				}
			});
		} else {
			frm.set_df_property('available_for_use_date', 'hidden', 1);
			frm.set_df_property('depreciation_posting_start_date', 'hidden', 1);
			frm.set_df_property('opening_accumulated_depreciation', 'hidden', 1);
			frm.set_df_property('salvage_value', 'hidden', 1);
			frm.set_df_property('finance_books', 'hidden', 1);

			frm.toggle_reqd('available_for_use_date', 0);
			frm.toggle_reqd('depreciation_posting_start_date', 0);
			frm.toggle_reqd('salvage_value', 0);
			frm.toggle_reqd('finance_books', 0);
		}
	},

	depreciation_template: function(frm) {
		if (frm.doc.depreciation_template) {
			frappe.db.get_value('Depreciation Template', frm.doc.depreciation_template, ['asset_life', 'asset_life_unit'], (r) => {
				if (r) {
					if (r.asset_life_unit == "Years") {
						frm.set_value("asset_life_in_months", (r.asset_life * 12));
					}
				}
			})
		}
	},
});

frappe.ui.form.on('Asset Finance Book_', {
	depreciation_template: function(frm, cdt, cdn) {
		const row = locals[cdt][cdn];

		frappe.db.get_value('Depreciation Template', row.depreciation_template, ['asset_life', 'asset_life_unit'], (r) => {
			if (r) {
				if (r.asset_life_unit == "Years") {
					row.asset_life_in_months = r.asset_life * 12;
					frm.refresh_field("finance_books");
				}
			}
		})
	},
});
