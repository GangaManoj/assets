# Copyright (c) 2021, Ganga Manoj and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

class AssetActivity(Document):
	def validate(self):
		self.validate_activity_date()

	def validate_activity_date(self):
		purchase_date = frappe.db.get_value("Asset", self.asset, 'purchase_date')

		if self.activity_date < purchase_date:
			frappe.throw(_("Asset Activity cannot be performed before {0}").format(purchase_date))

def create_asset_activity(asset, activity_date, activity_type, reference_doctype, reference_docname, notes=None):
	asset_activity = frappe.get_doc({
		'doctype': 'Asset Activity',
		'asset': asset,
		'activity_date': activity_date,
		'activity_type': activity_type,
		'reference_doctype': reference_doctype,
		'reference_docname': reference_docname,
		'notes': notes
	})
	asset_activity.submit()
