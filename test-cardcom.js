import 'dotenv/config';
// Using native fetch in Node 25


const CARDCOM_API_URL = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create';
const CARDCOM_TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER || '1000';
const CARDCOM_API_NAME = process.env.CARDCOM_API_NAME || 'cardtest1994';

async function testCardcom() {
    console.log('Testing Cardcom integration with:');
    console.log('Terminal:', CARDCOM_TERMINAL);
    console.log('API Name:', CARDCOM_API_NAME);

    const payload = {
        TerminalNumber: parseInt(CARDCOM_TERMINAL),
        ApiName: CARDCOM_API_NAME,
        ReturnValue: 'TEST_BY_AI',
        Amount: 10,
        SuccessRedirectUrl: 'http://localhost:5173/success',
        FailedRedirectUrl: 'http://localhost:5173/failed',
        Document: {
            Name: 'Test Customer',
            Email: 'test@example.com',
            Products: [
                {
                    Description: 'Test Product',
                    UnitCost: 10
                }
            ]
        }
    };

    try {
        const response = await fetch(CARDCOM_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.ResponseCode === 0) {
            console.log('SUCCESS: Generated payment URL:', result.Url);
        } else {
            console.log('FAILED:', result.Description || 'Unknown error');
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

testCardcom();
