public with sharing class QuickAccountController {
    @AuraEnabled
    public static Account createAccount(
        String name, 
        String accNumber, 
        String phone, 
        String website, 
        String industry, 
        Decimal revenue, 
        Integer employees, 
        String city
    ) {
        // --- 1. VALIDATION LOGIC (The "Bug" for the Demo) ---
        // We do this OUTSIDE the try-catch so the message isn't hidden.
        
        // DEMO BUG: Developer typed '>' instead of '<'
        // This means ANY positive revenue triggers the error.
        if (revenue != null && revenue > 0) {
            // We construct the exception carefully to ensure UI sees the text
            String msg = 'Business Rule Violation: Enterprise Accounts must have Annual Revenue of at least $10,000,000.';
            AuraHandledException e = new AuraHandledException(msg);
            e.setMessage(msg); // Required for LWC to see the message
            throw e;
        }
        // ----------------------------------------------------

        try {
            Account newAcc = new Account(
                Name = name,
                AccountNumber = accNumber,
                Phone = phone,
                Website = website,
                Industry = industry,
                AnnualRevenue = revenue,
                NumberOfEmployees = employees,
                BillingCity = city
            );
            
            // Allow duplicates
            Database.DMLOptions dml = new Database.DMLOptions();
            dml.DuplicateRuleHeader.allowSave = true; 
            dml.DuplicateRuleHeader.runAsCurrentUser = true;
            
            Database.SaveResult sr = Database.insert(newAcc, dml);
            
            if (sr.isSuccess()) {
                return newAcc;
            } else {
                String errorMsg = 'Database Error: ' + sr.getErrors()[0].getMessage();
                AuraHandledException e = new AuraHandledException(errorMsg);
                e.setMessage(errorMsg);
                throw e;
            }

        } catch (Exception e) {
            String errorMsg = e.getMessage();
            AuraHandledException customErr = new AuraHandledException(errorMsg);
            customErr.setMessage(errorMsg);
            throw customErr;
        }
    }
}