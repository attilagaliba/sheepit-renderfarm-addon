// user.js
(function () {
    'use strict';

    // Function to extract data from the profile section
    function extractProfileData() {
        const profileSection = document.querySelector('.w-section.inverse .container .row');
        if (!profileSection) return null;

        const data = {
            avatar: {
                imgSrc: profileSection.querySelector('.polaroid.avatar-big img')?.src || '',
                twitterLink: profileSection.querySelector('.col-md-2 a[href*="twitter"]')?.href || '',
                instagramLink: profileSection.querySelector('.col-md-2 a[href*="instagram"]')?.href || ''
            },
            userInfo: {
                username: profileSection.querySelector('.col-md-4.login h1')?.textContent.trim() || '',
                description: profileSection.querySelector('.col-md-4.login br')?.nextSibling?.textContent.trim() || '',
                editLink: profileSection.querySelector('.col-md-4.login a[href*="edit"]')?.href || ''
            },
            stats: {},
            connectedMachines: [],
            latestProjects: [],
            lastParticipations: [],
            pastSessions: []
        };

        // Extract stats from dl-horizontal
        const dtElements = profileSection.querySelectorAll('.col-md-4 dl dt');
        const ddElements = profileSection.querySelectorAll('.col-md-4 dl dd');
        dtElements.forEach((dt, index) => {
            const label = dt.textContent.trim();
            const value = ddElements[index]?.textContent.trim() || '';
            data.stats[label] = value;
        });

        // Extract connected machines
        const machineTable = document.querySelector('#masonryWr .item .w-box.blog-post h2 + .padding-15 table tbody tr td a');
        if (machineTable) {
            data.connectedMachines.push({ name: machineTable.textContent.trim(), link: machineTable.href || '' });
        }

        // Extract latest projects
        const projectTable = document.querySelectorAll('#masonryWr .item .w-box.blog-post h2 + .padding-15 table tbody tr');
        projectTable.forEach(row => {
            const projectLink = row.querySelector('td a')?.href || '';
            const projectName = row.querySelector('td a')?.textContent.trim() || '';
            const status = row.querySelector('td.msg_paused, td.msg_finished')?.textContent.trim() || '';
            if (projectName && status) {
                data.latestProjects.push({ name: projectName, link: projectLink, status: status });
            }
        });

        // Extract last participations
        const participationTable = document.querySelectorAll('#masonryWr .item .w-box.blog-post h2 + .padding-15 table tbody tr');
        participationTable.forEach(row => {
            const projectName = row.querySelector('td a')?.textContent.trim() || row.querySelector('td')?.textContent.trim() || '';
            const details = row.querySelector('td:nth-child(2)')?.getAttribute('title') || row.querySelector('td:nth-child(2)')?.textContent.trim() || '';
            const imgMatch = details.match(/src="([^"]+)"/);
            const imgSrc = imgMatch ? imgMatch[1] : '';
            const textDetails = details.replace(/<img[^>]+>/, '').trim() || row.querySelector('td:nth-child(2)')?.textContent.trim() || '';
            if (projectName && textDetails) {
                data.lastParticipations.push({ project: projectName, details: textDetails, imgSrc: imgSrc });
            }
        });

        // Extract past sessions
        const sessionList = document.querySelectorAll('#masonryWr .item .w-box.blog-post h2 + ul li a');
        sessionList.forEach(li => {
            const sessionLink = li.href || '';
            const sessionTime = li.textContent.trim() || '';
            if (sessionTime) {
                data.pastSessions.push({ link: sessionLink, time: sessionTime });
            }
        });

        return data;
    }

    // Function to redesign the profile page
    function redesignProfile(data) {
        if (!data) return;

        // Remove existing content
        const profileSection = document.querySelector('.w-section.inverse .container');
        profileSection.innerHTML = '';

        // Main container with futuristic design
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            color: #e0e0e0;
            font-family: 'Arial', sans-serif;
            position: relative;
            overflow: hidden;
            margin: 20px auto;
            max-width: 1200px;
        `;

        // Decorative overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 152, 0, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
            z-index: 0;
            opacity: 0.8;
        `;
        mainContainer.appendChild(overlay);

        // Hero Section (Profile Stats Table)
        const heroSection = document.createElement('div');
        heroSection.style.cssText = `
            background: linear-gradient(90deg, #2e2e2e, #3a3a3a);
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        `;
        const heroTitle = document.createElement('h2');
        heroTitle.textContent = 'Profile Overview';
        heroTitle.style.cssText = `
            color: #ff9800;
            font-size: 28px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 20px;
            text-shadow: 0 2px 6px rgba(255, 152, 0, 0.5);
        `;
        const statsTable = document.createElement('table');
        statsTable.style.cssText = `
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: #2e2e2e;
            border-radius: 8px;
            overflow: hidden;
        `;
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background: linear-gradient(90deg, #ff9800, #f57c00); color: #fff;">
                <th style="padding: 12px; text-align: left; font-weight: 700;">Stat</th>
                <th style="padding: 12px; text-align: right; font-weight: 700;">Value</th>
            </tr>
        `;
        const tbody = document.createElement('tbody');
        for (const [label, value] of Object.entries(data.stats)) {
            const tr = document.createElement('tr');
            tr.style.cssText = `border-bottom: 1px solid #444; transition: background-color 0.3s;`;
            tr.innerHTML = `
                <td style="padding: 12px; color: #e0e0e0;">${label}</td>
                <td style="padding: 12px; text-align: right; color: #e0e0e0;">${value}</td>
            `;
            tr.addEventListener('mouseover', () => tr.style.backgroundColor = '#3a3a3a');
            tr.addEventListener('mouseout', () => tr.style.backgroundColor = 'transparent');
            tbody.appendChild(tr);
        }
        statsTable.appendChild(thead);
        statsTable.appendChild(tbody);
        heroSection.appendChild(heroTitle);
        heroSection.appendChild(statsTable);
        mainContainer.appendChild(heroSection);

        // Header with Avatar and User Info
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        `;
        const avatarCol = document.createElement('div');
        avatarCol.style.cssText = `
            text-align: center;
            flex: 1;
            min-width: 200px;
        `;
        const avatarImg = document.createElement('div');
        avatarImg.style.cssText = `
            width: 150px;
            height: 150px;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto 15px;
            border: 4px solid #ff9800;
            box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
            transition: transform 0.3s;
        `;
        const img = document.createElement('img');
        img.src = data.avatar.imgSrc;
        img.alt = data.userInfo.username;
        img.style.cssText = `width: 100%; height: 100%; object-fit: cover;`;
        avatarImg.appendChild(img);
        avatarCol.appendChild(avatarImg);
        const socialLinks = document.createElement('div');
        socialLinks.style.cssText = `display: flex; gap: 15px; justify-content: center;`;
        if (data.avatar.twitterLink) {
            const twitterLink = document.createElement('a');
            twitterLink.href = data.avatar.twitterLink;
            twitterLink.target = '_blank';
            twitterLink.innerHTML = '<i class="fa-brands fa-twitter fa-2x" style="color: #1DA1F2;"></i>';
            socialLinks.appendChild(twitterLink);
        }
        if (data.avatar.instagramLink) {
            const instagramLink = document.createElement('a');
            instagramLink.href = data.avatar.instagramLink;
            instagramLink.target = '_blank';
            instagramLink.innerHTML = '<i class="fa-brands fa-instagram fa-2x" style="color: #E1306C;"></i>';
            socialLinks.appendChild(instagramLink);
        }
        avatarCol.appendChild(socialLinks);
        header.appendChild(avatarCol);
        const infoCol = document.createElement('div');
        infoCol.style.cssText = `
            flex: 2;
            min-width: 300px;
        `;
        const username = document.createElement('h1');
        username.textContent = data.userInfo.username;
        username.style.cssText = `
            color: #ff9800;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 6px rgba(255, 152, 0, 0.5);
        `;
        const description = document.createElement('p');
        description.textContent = data.userInfo.description;
        description.style.cssText = `font-size: 16px; color: #bbb; margin-bottom: 15px;`;
        const editLink = document.createElement('a');
        editLink.href = data.userInfo.editLink;
        editLink.textContent = 'Edit Profile';
        editLink.style.cssText = `
            font-size: 14px;
            color: #ff9800;
            text-decoration: none;
            transition: color 0.3s;
        `;
        editLink.addEventListener('mouseover', () => editLink.style.color = '#fff');
        editLink.addEventListener('mouseout', () => editLink.style.color = '#ff9800');
        infoCol.appendChild(username);
        infoCol.appendChild(description);
        infoCol.appendChild(editLink);
        header.appendChild(infoCol);
        mainContainer.appendChild(header);

        // Connected Machines Section
        const machinesSection = document.createElement('div');
        machinesSection.style.cssText = `
            background: #2e2e2e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        const machinesTitle = document.createElement('h3');
        machinesTitle.textContent = 'Connected Machines';
        machinesTitle.style.cssText = `
            color: #ff9800;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
        `;
        const machinesTable = document.createElement('table');
        machinesTable.style.cssText = `
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: #3a3a3a;
            border-radius: 8px;
            overflow: hidden;
        `;
        const machinesThead = document.createElement('thead');
        machinesThead.innerHTML = `
            <tr style="background: linear-gradient(90deg, #ff9800, #f57c00); color: #fff;">
                <th style="padding: 10px; text-align: left; font-weight: 700;">Machine</th>
                <th style="padding: 10px; text-align: left; font-weight: 700;">Link</th>
            </tr>
        `;
        const machinesTbody = document.createElement('tbody');
        data.connectedMachines.forEach(machine => {
            const tr = document.createElement('tr');
            tr.style.cssText = `border-bottom: 1px solid #444; transition: background-color 0.3s;`;
            tr.innerHTML = `
                <td style="padding: 10px; color: #e0e0e0;">${machine.name}</td>
                <td style="padding: 10px; color: #ff9800;"><a href="${machine.link}" target="_blank" style="color: #ff9800; text-decoration: none; transition: color 0.3s;">View</a></td>
            `;
            tr.addEventListener('mouseover', () => tr.style.backgroundColor = '#3a3a3a');
            tr.addEventListener('mouseout', () => tr.style.backgroundColor = 'transparent');
            machinesTbody.appendChild(tr);
        });
        machinesTable.appendChild(machinesThead);
        machinesTable.appendChild(machinesTbody);
        machinesSection.appendChild(machinesTitle);
        machinesSection.appendChild(machinesTable);
        mainContainer.appendChild(machinesSection);

        // Latest Projects Section
        const projectsSection = document.createElement('div');
        projectsSection.style.cssText = `
            background: #2e2e2e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        const projectsTitle = document.createElement('h3');
        projectsTitle.textContent = 'Latest Projects';
        projectsTitle.style.cssText = `
            color: #ff9800;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
        `;
        const projectsTable = document.createElement('table');
        projectsTable.style.cssText = `
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: #3a3a3a;
            border-radius: 8px;
            overflow: hidden;
        `;
        const projectsThead = document.createElement('thead');
        projectsThead.innerHTML = `
            <tr style="background: linear-gradient(90deg, #ff9800, #f57c00); color: #fff;">
                <th style="padding: 10px; text-align: left; font-weight: 700;">Project</th>
                <th style="padding: 10px; text-align: left; font-weight: 700;">Status</th>
                <th style="padding: 10px; text-align: left; font-weight: 700;">Link</th>
            </tr>
        `;
        const projectsTbody = document.createElement('tbody');
        data.latestProjects.forEach(project => {
            const tr = document.createElement('tr');
            tr.style.cssText = `border-bottom: 1px solid #444; transition: background-color 0.3s;`;
            tr.innerHTML = `
                <td style="padding: 10px; color: #e0e0e0;">${project.name}</td>
                <td style="padding: 10px; color: ${project.status === 'Paused' ? '#ff9800' : '#4CAF50'}; font-weight: 500;">${project.status}</td>
                <td style="padding: 10px; color: #ff9800;"><a href="${project.link}" target="_blank" style="color: #ff9800; text-decoration: none; transition: color 0.3s;">View</a></td>
            `;
            tr.addEventListener('mouseover', () => tr.style.backgroundColor = '#3a3a3a');
            tr.addEventListener('mouseout', () => tr.style.backgroundColor = 'transparent');
            projectsTbody.appendChild(tr);
        });
        projectsTable.appendChild(projectsThead);
        projectsTable.appendChild(projectsTbody);
        projectsSection.appendChild(projectsTitle);
        projectsSection.appendChild(projectsTable);
        mainContainer.appendChild(projectsSection);

        // Last Participations Gallery
        const participationsSection = document.createElement('div');
        participationsSection.style.cssText = `
            background: #2e2e2e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        const participationsTitle = document.createElement('h3');
        participationsTitle.textContent = 'Last 10 Participations';
        participationsTitle.style.cssText = `
            color: #ff9800;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
        `;
        const gallery = document.createElement('div');
        gallery.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
        `;
        data.lastParticipations.forEach((part, index) => {
            if (index < 10 && part.imgSrc) { // Limit to 10 and ensure image exists
                const card = document.createElement('div');
                card.style.cssText = `
                    background: #3a3a3a;
                    padding: 10px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    width: 200px;
                    text-align: center;
                    transition: transform 0.3s, box-shadow 0.3s;
                `;
                const img = document.createElement('img');
                img.src = part.imgSrc;
                img.alt = part.project;
                img.style.cssText = `
                    width: 180px;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    border: 2px solid #ff9800;
                `;
                const projectName = document.createElement('div');
                projectName.textContent = part.project;
                projectName.style.cssText = `color: #e0e0e0; font-weight: 500; margin-bottom: 5px;`;
                const details = document.createElement('div');
                details.textContent = part.details;
                details.style.cssText = `color: #bbb; font-size: 12px;`;
                card.appendChild(img);
                card.appendChild(projectName);
                card.appendChild(details);
                card.addEventListener('mouseover', () => {
                    card.style.transform = 'translateY(-5px)';
                    card.style.boxShadow = '0 6px 15px rgba(255, 152, 0, 0.4)';
                });
                card.addEventListener('mouseout', () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                });
                gallery.appendChild(card);
            }
        });
        participationsSection.appendChild(participationsTitle);
        participationsSection.appendChild(gallery);
        mainContainer.appendChild(participationsSection);

        // Past Sessions Section
        const sessionsSection = document.createElement('div');
        sessionsSection.style.cssText = `
            background: #2e2e2e;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        const sessionsTitle = document.createElement('h3');
        sessionsTitle.textContent = '20 Last Sessions';
        sessionsTitle.style.cssText = `
            color: #ff9800;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
        `;
        const sessionsTable = document.createElement('table');
        sessionsTable.style.cssText = `
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: #3a3a3a;
            border-radius: 8px;
            overflow: hidden;
        `;
        const sessionsThead = document.createElement('thead');
        sessionsThead.innerHTML = `
            <tr style="background: linear-gradient(90deg, #ff9800, #f57c00); color: #fff;">
                <th style="padding: 10px; text-align: left; font-weight: 700;">Session Time</th>
                <th style="padding: 10px; text-align: left; font-weight: 700;">Link</th>
            </tr>
        `;
        const sessionsTbody = document.createElement('tbody');
        data.pastSessions.forEach(session => {
            const tr = document.createElement('tr');
            tr.style.cssText = `border-bottom: 1px solid #444; transition: background-color 0.3s;`;
            tr.innerHTML = `
                <td style="padding: 10px; color: #e0e0e0;">${session.time}</td>
                <td style="padding: 10px; color: #ff9800;"><a href="${session.link}" target="_blank" style="color: #ff9800; text-decoration: none; transition: color 0.3s;">View</a></td>
            `;
            tr.addEventListener('mouseover', () => tr.style.backgroundColor = '#3a3a3a');
            tr.addEventListener('mouseout', () => tr.style.backgroundColor = 'transparent');
            sessionsTbody.appendChild(tr);
        });
        sessionsTable.appendChild(sessionsThead);
        sessionsTable.appendChild(sessionsTbody);
        sessionsSection.appendChild(sessionsTitle);
        sessionsSection.appendChild(sessionsTable);
        mainContainer.appendChild(sessionsSection);

        profileSection.appendChild(mainContainer);
    }

    // Execute redesign when the page is loaded
    const profileData = extractProfileData();
    if (profileData) {
        redesignProfile(profileData);
    }
})();