// CGF Security Quiz - Question Database with Categories
let questionBank = {
    "Physical Security": [
        {
            id: "ps001",
            question: "What is the primary purpose of a mantrap in data center security?",
            options: [
                "Prevent tailgating and unauthorized access",
                "Monitor temperature and humidity",
                "Control airflow and ventilation",
                "Reduce noise levels"
            ],
            correct: 0,
            explanation: "A mantrap is designed to prevent tailgating by allowing only one person to pass through at a time."
        },
        {
            id: "ps002",
            question: "How often should security cameras be tested for functionality?",
            options: [
                "Daily",
                "Weekly", 
                "Monthly",
                "Quarterly"
            ],
            correct: 2,
            explanation: "Security cameras should be tested monthly to ensure proper functionality and coverage."
        },
        {
            id: "ps003",
            question: "What does 'tailgating' refer to in physical security?",
            options: [
                "Following vehicles too closely in parking areas",
                "Unauthorized entry by following authorized personnel",
                "Monitoring network traffic patterns",
                "Backup power system activation"
            ],
            correct: 1,
            explanation: "Tailgating is when an unauthorized person follows an authorized person through a secure entrance."
        },
        {
            id: "ps004",
            question: "Which is NOT a component of defense in depth for physical security?",
            options: [
                "Perimeter barriers and fencing",
                "Access control systems",
                "Network firewalls",
                "Surveillance camera systems"
            ],
            correct: 2,
            explanation: "Network firewalls are logical security controls, not physical security components."
        },
        {
            id: "ps005",
            question: "What is the recommended approach for visitor access to secure areas?",
            options: [
                "Allow unescorted access with visitor badge",
                "Require escort by authorized personnel at all times",
                "Permit access during business hours only",
                "Allow access to common areas without restrictions"
            ],
            correct: 1,
            explanation: "Visitors should always be escorted by authorized personnel in secure areas."
        },
        {
            id: "ps006",
            question: "What should be the first response to a security breach alarm?",
            options: [
                "Reset the alarm system",
                "Check surveillance footage",
                "Secure the area and verify the threat",
                "Contact building maintenance"
            ],
            correct: 2,
            explanation: "The immediate priority is to secure the area and verify if there's an actual threat."
        }
    ],
    
    "Access Control": [
        {
            id: "ac001",
            question: "What does the principle of least privilege mean?",
            options: [
                "Providing maximum access for operational efficiency",
                "Granting minimum access required for job functions",
                "Ensuring equal access rights for all employees",
                "Eliminating all access restrictions"
            ],
            correct: 1,
            explanation: "Least privilege means granting only the minimum access necessary to perform job duties."
        },
        {
            id: "ac002",
            question: "How frequently should access rights be reviewed?",
            options: [
                "Never, once granted they remain valid",
                "Annually during performance reviews",
                "Quarterly or when roles change",
                "Only when employees leave"
            ],
            correct: 2,
            explanation: "Access rights should be reviewed quarterly and whenever there are role changes."
        },
        {
            id: "ac003",
            question: "What is multi-factor authentication (MFA)?",
            options: [
                "Using multiple complex passwords",
                "Authentication using two or more verification factors",
                "Having multiple user accounts for different systems",
                "Using only biometric scanners for access"
            ],
            correct: 1,
            explanation: "MFA requires two or more different types of authentication factors (something you know, have, or are)."
        },
        {
            id: "ac004",
            question: "When should access credentials be immediately revoked?",
            options: [
                "At the end of each business day",
                "When an employee goes on vacation",
                "Upon termination or role change",
                "After 90 days of employment"
            ],
            correct: 2,
            explanation: "Access should be revoked immediately when employment ends or roles change significantly."
        },
        {
            id: "ac005",
            question: "What is the purpose of role-based access control (RBAC)?",
            options: [
                "To assign access based on individual preferences",
                "To group permissions based on job functions",
                "To provide unlimited access to all resources",
                "To eliminate the need for authentication"
            ],
            correct: 1,
            explanation: "RBAC groups permissions into roles based on job functions, making access management more efficient."
        },
        {
            id: "ac006",
            question: "What should you do if you suspect your access credentials are compromised?",
            options: [
                "Continue using them and monitor for issues",
                "Share them with a trusted colleague",
                "Immediately report and request credential reset",
                "Wait until the next scheduled password change"
            ],
            correct: 2,
            explanation: "Suspected compromised credentials should be reported immediately and reset as soon as possible."
        }
    ],
    
    "Data Protection": [
        {
            id: "dp001",
            question: "What is the primary purpose of data classification?",
            options: [
                "To organize files alphabetically for easy searching",
                "To determine appropriate security controls and handling",
                "To reduce data storage costs",
                "To improve system search functionality"
            ],
            correct: 1,
            explanation: "Data classification helps determine what security controls and handling procedures are needed."
        },
        {
            id: "dp002",
            question: "Which encryption standard is currently recommended for sensitive data?",
            options: [
                "DES (Data Encryption Standard)",
                "3DES (Triple DES)",
                "AES-256 (Advanced Encryption Standard)",
                "MD5 (Message Digest Algorithm)"
            ],
            correct: 2,
            explanation: "AES-256 is the current gold standard for encrypting sensitive data."
        },
        {
            id: "dp003",
            question: "What is the difference between data at rest and data in transit?",
            options: [
                "Data at rest is archived, data in transit is active",
                "Data at rest is stored, data in transit is being transmitted",
                "Data at rest is encrypted, data in transit is not",
                "Data at rest is on servers, data in transit is on workstations"
            ],
            correct: 1,
            explanation: "Data at rest refers to stored data, while data in transit is data being transmitted over networks."
        },
        {
            id: "dp004",
            question: "What should be done with sensitive data on portable devices?",
            options: [
                "Store it in clearly labeled folders",
                "Encrypt it and use strong authentication",
                "Avoid storing any sensitive data",
                "Both B and C are correct approaches"
            ],
            correct: 3,
            explanation: "Sensitive data on portable devices should be encrypted with strong authentication, or avoided entirely."
        },
        {
            id: "dp005",
            question: "What is a data retention policy?",
            options: [
                "Rules for how long data should be kept",
                "Guidelines for data backup frequency",
                "Procedures for data access requests",
                "Standards for data encryption methods"
            ],
            correct: 0,
            explanation: "A data retention policy defines how long different types of data should be kept before deletion."
        },
        {
            id: "dp006",
            question: "What is the purpose of data loss prevention (DLP) systems?",
            options: [
                "To backup data automatically",
                "To monitor and prevent unauthorized data transmission",
                "To compress data for storage efficiency",
                "To translate data between different formats"
            ],
            correct: 1,
            explanation: "DLP systems monitor data movement and prevent unauthorized transmission of sensitive information."
        }
    ],
    
    "Incident Response": [
        {
            id: "ir001",
            question: "What is the first step in the incident response process?",
            options: [
                "Containment of the incident",
                "Identification and detection",
                "Recovery and restoration",
                "Lessons learned documentation"
            ],
            correct: 1,
            explanation: "The first step is identifying and detecting that an incident has occurred."
        },
        {
            id: "ir002",
            question: "How long should incident response logs be retained?",
            options: [
                "30 days minimum",
                "90 days minimum",
                "1 year minimum",
                "According to company policy and legal requirements"
            ],
            correct: 3,
            explanation: "Retention periods should follow company policy and legal requirements, which vary by organization and jurisdiction."
        },
        {
            id: "ir003",
            question: "What is the purpose of the containment phase in incident response?",
            options: [
                "To identify the root cause of the incident",
                "To prevent the incident from spreading or causing more damage",
                "To restore normal operations",
                "To document lessons learned"
            ],
            correct: 1,
            explanation: "Containment aims to prevent the incident from spreading and causing additional damage."
        },
        {
            id: "ir004",
            question: "Who should be notified first during a security incident?",
            options: [
                "All employees via company-wide email",
                "The incident response team and management",
                "External customers and partners",
                "Law enforcement agencies"
            ],
            correct: 1,
            explanation: "The incident response team and appropriate management should be notified first to coordinate the response."
        },
        {
            id: "ir005",
            question: "What is the primary goal of the recovery phase?",
            options: [
                "To identify who caused the incident",
                "To restore systems to normal operation",
                "To prevent similar incidents in the future",
                "To calculate the cost of the incident"
            ],
            correct: 1,
            explanation: "The recovery phase focuses on restoring affected systems and services to normal operation."
        },
        {
            id: "ir006",
            question: "Why is documentation important during incident response?",
            options: [
                "To meet compliance requirements only",
                "To support legal proceedings and improve future response",
                "To assign blame to responsible parties",
                "To create reports for external auditors"
            ],
            correct: 1,
            explanation: "Documentation supports legal needs, compliance, and helps improve future incident response capabilities."
        }
    ]
};

// Quiz configuration with hardcoded admin credentials
const quizConfig = {
    questionsPerCategory: 4,
    categories: Object.keys(questionBank),
    passingScore: 70,
    timeLimit: null,
    adminCredentials: {
        username: "axchibobAD",
        password: "admin123"
    }
};

// Load custom questions and categories from localStorage
function loadCustomData() {
    const customQuestions = localStorage.getItem('cgf-custom-questions');
    const customCategories = localStorage.getItem('cgf-custom-categories');
    
    if (customQuestions) {
        const custom = JSON.parse(customQuestions);
        Object.keys(custom).forEach(category => {
            if (questionBank[category]) {
                questionBank[category] = [...questionBank[category], ...custom[category]];
            } else {
                questionBank[category] = custom[category];
            }
        });
    }
    
    if (customCategories) {
        const categories = JSON.parse(customCategories);
        categories.forEach(category => {
            if (!questionBank[category.name]) {
                questionBank[category.name] = [];
            }
        });
    }
    
    quizConfig.categories = Object.keys(questionBank);
}

// Save custom questions
function saveCustomQuestions() {
    const customQuestions = {};
    Object.keys(questionBank).forEach(category => {
        const customQs = questionBank[category].filter(q => q.id.startsWith('custom_'));
        if (customQs.length > 0) {
            customQuestions[category] = customQs;
        }
    });
    localStorage.setItem('cgf-custom-questions', JSON.stringify(customQuestions));
}

// Save custom categories
function saveCustomCategories() {
    const categories = Object.keys(questionBank).map(name => ({
        name: name,
        description: `Questions related to ${name}`,
        questionCount: questionBank[name].length
    }));
    localStorage.setItem('cgf-custom-categories', JSON.stringify(categories));
}

// Initialize data
loadCustomData();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { questionBank, quizConfig, loadCustomData, saveCustomQuestions, saveCustomCategories };
}
