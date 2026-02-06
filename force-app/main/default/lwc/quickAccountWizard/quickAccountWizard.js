import { LightningElement, track } from 'lwc';
import createAccount from '@salesforce/apex/QuickAccountController.createAccount';

export default class QuickAccountWizard extends LightningElement {
    @track successMessage = '';
    @track errorMessage = '';

    // Form Data
    formData = {
        name: '',
        accNumber: '',
        phone: '',
        website: '',
        industry: '',
        revenue: null,
        employees: null,
        city: ''
    };

    // Removed industryOptions getter (Simpler Code)

    handleInputChange(event) {
        const fieldMap = {
            'accName': 'name',
            'accNumber': 'accNumber',
            'accPhone': 'phone',
            'accWebsite': 'website',
            'accIndustry': 'industry',
            'accRevenue': 'revenue',
            'accEmployees': 'employees',
            'accCity': 'city'
        };

        const fieldId = event.target.dataset.id;
        const key = fieldMap[fieldId];
        
        if (key) {
            this.formData[key] = event.target.value;
        }
    }

    handleCreate() {
        this.successMessage = '';
        this.errorMessage = '';

        const nameInput = this.template.querySelector('[data-id="accName"]');
        if (!this.formData.name) {
            nameInput.setCustomValidity("Account Name is required.");
            nameInput.reportValidity();
            return;
        } else {
            nameInput.setCustomValidity("");
            nameInput.reportValidity();
        }

        createAccount({ 
            name: this.formData.name,
            accNumber: this.formData.accNumber,
            phone: this.formData.phone,
            website: this.formData.website,
            industry: this.formData.industry,
            revenue: this.formData.revenue,
            employees: this.formData.employees,
            city: this.formData.city
        })
        .then(result => {
            this.successMessage = `Account "${result.Name}" created successfully!`;
            this.template.querySelectorAll('lightning-input').forEach(input => {
                input.value = null;
            });
            this.formData = {}; 
        })
        .catch(error => {
            this.errorMessage = 'Error: ' + (error.body ? error.body.message : error.message);
        });
    }
}