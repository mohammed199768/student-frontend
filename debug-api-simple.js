// eslint-disable-next-line @typescript-eslint/no-require-imports
const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('https://manalbackend-production.up.railway.app/api/v1/catalog/courses');
        console.log('STATUS:', res.status);
        if (res.data && res.data.data && res.data.data.courses) {
            console.log('COUNT:', res.data.data.courses.length);
            if (res.data.data.courses.length > 0) {
                const c = res.data.data.courses[0];
                console.log('COURSE 1:', c.title, c.thumbnail);
            }
        } else {
            console.log('DATA MISSING');
            console.log(JSON.stringify(res.data, null, 2));
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

test();
