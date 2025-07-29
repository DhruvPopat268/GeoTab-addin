import React from 'react';
import Navbar from './Navbar.jsx';


const steps = [
    { id: 1, text: 'This is your "Wallet Balance"', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363380/step1_mmgyx2.jpg' },

    { id: 2, text: 'This is your "Total Credits"', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363380/step2_tb7wjd.jpg' },

    { id: 3, text: 'To add fund balance Click "Wallet"', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363380/step3_z1x3v8.jpg' },

    { id: 4, text: 'Here you have to add balance to use UK License Check API', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363378/step4_jsfaiz.jpg' },

    { id: 5, text: 'After Payment You will get your balance here', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363376/step5_x7vbiu.jpg' },

    { id: 6, text: 'Purchase plans from balance to get Credits - click "License Check API Plan"', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363376/step6_ftdbgm.jpg' },

    { id: 7, text: 'Here are different plans', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363376/step7_frw2hz.jpg' },

    { id: 8, text: 'Click "Get Plan" to purchase that plan', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363376/step8_g0kv3g.jpg' },

    { id: 9, text: 'Click "Yes, Purchase"', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363376/step9_bnjdhw.jpg' },

    { id: 10, text: 'Click "Dashboard"', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363373/step10_plk2rt.jpg' },

    { id: 11, text: 'Your updated balance )', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363372/step11_v2hmfz.jpg' },

    { id: 12, text: 'credits will reflect here (1 credit = 1 API call', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363372/step12_hha43q.jpg' },

    { id: 13, text: 'See the Expiry Date (e.g., 23/08/2025) - after that credits = 0 even if unused', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363372/step13_rrorno.jpg' },

    { id: 14, text: 'Click "License Check" to make API Call', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363372/step14_sv2kha.jpg' },

    { id: 15, text: 'Click "Sync" to trigger API Call', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step15_s7p6rk.jpg' },

    { id: 16, text: 'Click "OK"', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step16_mzgtzc.jpg' },

    { id: 17, text: 'API response data will be shown here', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step17_ikv7dk.jpg' },

    { id: 18, text: 'Click "View" to see last License Check API data', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step18_uugqga.jpg' },

    { id: 20, text: 'Last License Check API data appears here', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step19_fsdyfw.jpg' },

    { id: 21, text: 'Click "History" to view all License Check API call history', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step20_hied5d.jpg' },

    { id: 22, text: 'Full API history will appear here', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step21_tfgzlt.jpg' },

    { id: 23, text: 'Click the icon to see data for a particular License Check', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step22_ihb8nw.jpg' },

    { id: 24, text: 'Specific License Check data is shown', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step23_slouvv.jpg' },

    { id: 25, text: 'Click "API Usage" to view API usage logs', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step24_vzetas.jpg' },

    { id: 26, text: 'You can see how many calls were successful or failed', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step25_hry6hc.jpg' },

    { id: 27, text: 'Scroll down to view usage statistics', img: 'https://res.cloudinary.com/deqab5u6x/image/upload/v1753363371/step26_odz1ci.jpg' },
];

const MyGeoTabWalletGuide = () => {
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <Navbar />

            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
                🧾 MyGeoTab Add-In User Guide
            </h2>

            {steps.map((step) => (
                <div key={step.id} style={{ marginBottom: '3rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginLeft: '70px',
                            marginBottom: '1rem',
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Step {step.id}:</h3>
                        <p style={{ margin: 0, fontSize: '1.5rem' }}>{step.text}</p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={step.img}
                            alt={`Step ${step.id}`}
                            style={{
                                maxWidth: '100%',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyGeoTabWalletGuide;
