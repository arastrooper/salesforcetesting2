import { LightningElement, track } from 'lwc';
import createAccount from '@salesforce/apex/QuickAccountController.createAccount';

export default class QuickAccountWizard extends LightningElement {
    @track successMessage = '';
    @track errorMessage = '';

    // Form Data
    @track formData = {
        name: '',
        accNumber: '',
        phone: '',
        website: '',
        industry: '',
        revenue: null,
        employees: null,
        city: ''
    };

    // --- NEW LOGIC: Button State ---
    get isSaveDisabled() {
        // 1. Account Name is mandatory
        if (!this.formData.name) return true;

        // 2. Revenue must be >= 10,000,000
        // The bot enters 5,000,000, so this condition will be TRUE (Button Disabled)
        // We convert to Number() to ensure math comparison works correctly
        if (!this.formData.revenue || Number(this.formData.revenue) < 10000000) {
            return true;
        }

        return false;
    }

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
            
            // Optional: You can show a custom error message on the field itself
            // so the user knows WHY the button is disabled
            if (fieldId === 'accRevenue') {
                const inputCmp = this.template.querySelector('[data-id="accRevenue"]');
                const val = Number(event.target.value);
                
                if (val < 10000000) {
                    inputCmp.setCustomValidity("Revenue must be at least $10,000,000 to proceed.");
                } else {
                    inputCmp.setCustomValidity("");
                }
                inputCmp.reportValidity();
            }
        }
    }

    handleCreate() {
        this.successMessage = '';
        this.errorMessage = '';

        // Double check validation (Redundant but safe)
        if (this.isSaveDisabled) return;

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