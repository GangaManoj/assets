// Copyright (c) 2021, Ganga Manoj and contributors
// For license information, please see license.txt

frappe.ui.form.on('Asset Maintenance_', {
	setup: (frm) => {
		frm.set_query("assign_to", "asset_maintenance_tasks", function(doc) {
			return {
				query: "assets.asset.doctype.asset_maintenance_.asset_maintenance_.get_team_members",
				filters: {
					maintenance_team: doc.maintenance_team
				}
			};
		});

		frm.fields_dict.serial_no.get_query = function(doc) {
			return {
				filters: {
					'asset': doc.asset_name
				}
			};
		};

		frm.set_indicator_formatter('maintenance_status',
			function(doc) {
				let indicator = 'blue';

				if (doc.maintenance_status == 'Overdue') {
					indicator = 'orange';
				}
				else if (doc.maintenance_status == 'Cancelled') {
					indicator = 'red';
				}

				return indicator;
			}
		);
	},

	refresh: (frm) => {
		if (!frm.is_new()) {
			frm.trigger('make_dashboard');
		}
	},

	make_dashboard: (frm) => {
		if (!frm.is_new()) {
			frappe.call({
				method: 'assets.asset.doctype.asset_maintenance_.asset_maintenance_.get_maintenance_log',
				args: {
					asset_name: frm.doc.asset_name
				},
				callback: (r) => {
					if(r.message) {
						const section = frm.dashboard.add_section('', __("Maintenance Log"));
						var rows = $('<div></div>').appendTo(section);

						(r.message || []).forEach(function(d) {
							$(`<div class='row' style='margin-bottom: 10px;'>
								<div class='col-sm-3 small'>
									<a onclick="frappe.set_route('List', 'Asset Maintenance Log_',
										{'asset_name': '${d.asset_name}','maintenance_status': '${d.maintenance_status}' });">
										${d.maintenance_status} <span class="badge">${d.count}</span>
									</a>
								</div>
							</div>`).appendTo(rows);
						});
						frm.dashboard.show();
					}
				}
			});
		}
	}
});

frappe.ui.form.on('Asset Maintenance Task_', {
	start_date: (frm, cdt, cdn)  => {
		get_next_due_date(frm, cdt, cdn);
	},
	periodicity: (frm, cdt, cdn)  => {
		get_next_due_date(frm, cdt, cdn);
	},
	last_completion_date: (frm, cdt, cdn)  => {
		get_next_due_date(frm, cdt, cdn);
	},
	end_date: (frm, cdt, cdn)  => {
		get_next_due_date(frm, cdt, cdn);
	}
});

var get_next_due_date = function (frm, cdt, cdn) {
	var d = locals[cdt][cdn];

	if (d.start_date && d.periodicity) {
		return frappe.call({
			method: 'erpnext.assets.doctype.asset_maintenance.asset_maintenance.calculate_next_due_date',
			args: {
				start_date: d.start_date,
				periodicity: d.periodicity,
				end_date: d.end_date,
				last_completion_date: d.last_completion_date,
				next_due_date: d.next_due_date
			},
			callback: function(r) {
				if (r.message) {
					frappe.model.set_value(cdt, cdn, 'next_due_date', r.message);
				}
				else {
					frappe.model.set_value(cdt, cdn, 'next_due_date', '');
				}
			}
		});
	}
};