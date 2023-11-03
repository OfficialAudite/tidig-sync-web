// src/routes/+page.server.js
const mainHeader = "Datum, Artikel, Tid (timmar), Kund, Projekt, Aktivitet, Ärendenummer, Beskrivning"

function roundToHalfHour(seconds) {
    let hours = seconds / 3600;
    let roundedHours = Math.round(hours * 2) / 2;
    return roundedHours % 1 === 0 ? roundedHours : roundedHours.toFixed(1);
}

function createAuthHeader(email, password) {
    const encodedCredentials = btoa(`${email}:${password}`);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
    };
}

function incrementDate(dateInput, increment) {
    var dateFormatTotime = new Date(dateInput);
    var increasedDate = new Date(dateFormatTotime.getTime() + (increment * 86400000));
    return increasedDate;
}

async function getDataFromApi(url, headers) {
    try {
        const response = await fetch(url, { headers: headers });
        if (response.ok) {
            return await response.json();
        } else {
            console.error(`Failed to retrieve data: ${response.status} ${await response.text()}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export const actions = {
    login: async ({ request, url }) => {
        const formData = await request.formData()
        const email = formData.get('email')
        const password = formData.get('password')
        const dateFrom = formData.get('dateFrom')
        let dateTo = formData.get('dateTo')
        let dateToNew

        dateToNew = new Date(`${dateTo}`)
        dateToNew = incrementDate(dateToNew, 1)
        dateToNew = dateToNew.toISOString().split('T')[0]

        const apiUrl = "https://api.track.toggl.com/api/v9"
        const authHeaders = createAuthHeader(email, password);
        const pattern = /\((.*?)\)/;

        let clients
        let projects
        let timeEntries
        
        timeEntries = await getDataFromApi(`${apiUrl}/me/time_entries?start_date=${dateFrom}&end_date=${dateToNew}`, authHeaders);
        if(timeEntries.length != 0) {
            let workspaceid = timeEntries[0]['workspace_id'];
            clients = await getDataFromApi(`${apiUrl}/workspaces/${workspaceid}/clients`, authHeaders);
            projects = await getDataFromApi(`${apiUrl}/workspaces/${workspaceid}/projects`, authHeaders);

            const clientsDict = Object.fromEntries(clients.map(client => [client['id'], client['name']]));
            const projectsDict = Object.fromEntries(projects.map(project => [project['id'], [project['name'], project['client_id']]]));

            const formattedData = timeEntries.map(time => {
                const dt = new Date(time['start']);
                const formattedDate = dt.toISOString().split('T')[0];

                const descriptionWithoutTask = time['description'].replace(pattern, '').trim();
                const taskMatch = pattern.exec(time['description']);
                const task = taskMatch ? taskMatch[1] : ' ';

                const [projectName, clientId] = projectsDict[time['project_id']] || ["Unknown Project", null];
                const clientName = clientsDict[clientId] || "Unknown Client";

                const firstTag = time['tags'] && time['tags'].length > 0 ? time['tags'][0] : 'Programming';

                return `${formattedDate},Normal,${roundToHalfHour(time['duration'])},${clientName},${projectName},${firstTag},${task},${descriptionWithoutTask}`;
            });

            console.log(formattedData);

            return{
                message: 'Your data has been fetched and converted to CSV',
                success: true,
                data: mainHeader + '\n' + formattedData.join('\n')
            }

        }else{
            return {
                message: 'ERROR: No time entries found for the selected period. Please try again with a different period.',
                success: false,
                data: ''
            }
        }
    }
}