const axios = require('axios');

async function test() {
    try {
        console.log('Fetching courses...');
        const res = await axios.get('https://manalbackend-production.up.railway.app/api/v1/catalog/courses');
        console.log('Response Status:', res.status);
        console.log('Response Data Structure:', Object.keys(res.data));
        if (res.data.data) {
            console.log('Response Data.Data Structure:', Object.keys(res.data.data));
            if (res.data.data.courses) {
                console.log('Courses count:', res.data.data.courses.length);
                if (res.data.data.courses.length > 0) {
                    console.log('First Course:', JSON.stringify(res.data.data.courses[0], null, 2));
                }
            }
        } else {
            console.log('res.data.data is undefined');
        }

        console.log('Fetching universities...');
        const uniRes = await axios.get('https://manalbackend-production.up.railway.app/api/v1/catalog/universities');
        console.log('Uni Response Status:', uniRes.status);
        console.log('Uni Response Data Structure:', Object.keys(uniRes.data));
        if (uniRes.data.data) {
            console.log('Universities count:', uniRes.data.data.length);
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Response data:', e.response.data);
        }
    }
}

test();
