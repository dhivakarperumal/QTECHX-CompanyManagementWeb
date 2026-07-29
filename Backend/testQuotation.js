const jwt = require('jsonwebtoken');
const fetch = globalThis.fetch || require('node-fetch');
const secret = 'b6200e96c5a15f352edb68fd3dc0e4d8';
const token = jwt.sign({ user_id: 'a221f2de-8668-11f1-8f5e-2bc0420863d7', username: 'Admin', role: 'Super Admin', email: 'admin@gmail.com' }, secret, { expiresIn: '7d' });
const body = {
  client_name: 'Test Client',
  company_name: 'Test Co',
  contact_person: 'QA Tester',
  email: 'qa@testco.com',
  phone_number: '+911234567890',
  project_name: 'QA Project',
  project_description: 'Test quotation creation',
  service_type: 'Website Development',
  quotation_date: '2026-07-29',
  valid_until: '2026-08-28',
  currency: 'INR',
  payment_terms: '50%-50%',
  delivery_timeline: '4 Weeks',
  sales_executive: 'Admin',
  prepared_by: 'Admin',
  items: [
    { service_name: 'Design', description: 'UI design work', quantity: 1, unit: 'Hour', unit_price: 100, discount: 0, tax_percentage: 18, total: 100 }
  ],
  grand_total: 100,
  status: 'Draft',
  approval_status: 'Pending',
  payment_status: 'Pending'
};
(async () => {
  const resp = await fetch('http://localhost:5000/api/quotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  const text = await resp.text();
  console.log('STATUS', resp.status);
  console.log(text);
})();
