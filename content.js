// Wait for the page to fully load
window.addEventListener('load', function() {
    setTimeout(createStatsTable, 1000);
});

function createStatsTable() {
    if (!document.querySelector('.square.btn-neutral')) {
        return;
    }

    // Extract renderer count
    function getRendererCount() {
        const rendererLinks = document.querySelectorAll('.col-md-12.tiles .row a');
        return rendererLinks.length;
    }

    // Extract thumbnails and display 10 random ones using direct image URLs
    function displayRandomThumbnails() {
        const adBanner = document.querySelector('div[style*="width:728px"][style*="height:90px"]');
        if (adBanner) {
            const thumbnails = document.querySelectorAll('.square.btn-neutral');
            const thumbnailArray = Array.from(thumbnails);

            // Extract image URLs from the title attribute
            const imageUrls = thumbnailArray
                .map(thumb => {
                    const title = thumb.getAttribute('title');
                    const match = title.match(/<img src="([^"]+)"/);
                    return match ? match[1] : null;
                })
                .filter(url => url !== null);

            // Select 10 random image URLs
            const randomImageUrls = imageUrls.sort(() => 0.5 - Math.random()).slice(0, 10);

            // Create a container for thumbnails
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.style.cssText = `
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background-color: #1a1a1a;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                margin: 15px 0;
                overflow-x: auto;
                white-space: nowrap;
            `;

            randomImageUrls.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = `
                    height: 100px;
                    width: auto;
                    border-radius: 8px;
                    border: 2px solid #ff8c00;
                    transition: transform 0.3s, box-shadow 0.3s;
                    object-fit: cover;
                `;
                img.addEventListener('mouseover', () => {
                    img.style.transform = 'scale(1.1)';
                    img.style.boxShadow = '0 4px 15px rgba(255, 140, 0, 0.5)';
                });
                img.addEventListener('mouseout', () => {
                    img.style.transform = 'scale(1)';
                    img.style.boxShadow = 'none';
                });
                thumbnailContainer.appendChild(img);
            });

            // Replace the ad banner with the thumbnail container
            adBanner.parentNode.replaceChild(thumbnailContainer, adBanner);
        }
    }

    // Add countdown timer for remaining time
    function startCountdown() {
        const progressionLi = document.getElementById('project_job_938892_progression');
        if (progressionLi) {
            const remainingText = progressionLi.textContent.match(/remaining (\d+h)?(\d+m)?/);
            if (remainingText) {
                let hours = remainingText[1] ? parseInt(remainingText[1].replace('h', '')) : 0;
                let minutes = remainingText[2] ? parseInt(remainingText[2].replace('m', '')) : 0;
                let totalSeconds = (hours * 60 + minutes) * 60;

                const countdownSpan = document.createElement('span');
                countdownSpan.style.color = '#ff8c00';
                countdownSpan.style.fontWeight = '600';
                progressionLi.appendChild(countdownSpan);

                const updateCountdown = () => {
                    if (totalSeconds <= 0) {
                        countdownSpan.textContent = ' (Tahmini: Tamamlandı)';
                        return;
                    }

                    const hoursLeft = Math.floor(totalSeconds / 3600);
                    const minutesLeft = Math.floor((totalSeconds % 3600) / 60);
                    const secondsLeft = totalSeconds % 60;
                    countdownSpan.textContent = ` (Tahmini: ${hoursLeft}h${minutesLeft}m${secondsLeft}s)`;
                    totalSeconds--;
                };

                updateCountdown();
                setInterval(updateCountdown, 1000);
            }
        }
    }

    function extractFrameData() {
        const frames = [];
        const squares = document.querySelectorAll('.square.btn-neutral');
        
        squares.forEach(square => {
            const title = square.getAttribute('title');
            if (title) {
                const frameMatch = title.match(/frame: (\d+)/);
                const rendertimeMatch = title.match(/rendertime: (\d+)m(\d+)s/);
                const costMatch = title.match(/cost: (\d+)/);
                
                if (frameMatch && rendertimeMatch) {
                    const frameNumber = parseInt(frameMatch[1]);
                    const minutes = parseInt(rendertimeMatch[1]);
                    const seconds = parseInt(rendertimeMatch[2]);
                    const totalSeconds = minutes * 60 + seconds;
                    const cost = costMatch ? parseInt(costMatch[1]) : 0;
                    
                    frames.push({
                        frame: frameNumber,
                        rendertime: `${minutes}m${seconds.toString().padStart(2, '0')}s`,
                        rendertimeSeconds: totalSeconds,
                        cost: cost
                    });
                }
            }
        });
        
        return frames;
    }

    function createTable(frames) {
        if (document.querySelector('.render-stats-table')) {
            return;
        }

        const tableDiv = document.createElement('div');
        tableDiv.className = 'render-stats-table';
        tableDiv.style.cssText = `
            margin: 20px 0;
            padding: 20px;
            background-color: #1a1a1a;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        `;
        
        const topFrames = frames.slice(0, 10);
        
        let tableHTML = `
            <div style="margin-bottom: 15px; font-weight: bold; font-size: 18px; color: #ff8c00;">Top 10 Frames by Render Time</div>
            <table style="width: 100%; border-collapse: collapse; background-color: #2a2a2a; border-radius: 8px; overflow: hidden;" id="statsTable">
                <thead>
                    <tr style="background-color: #3a3a3a; color: #ff8c00;">
                        <th style="padding: 12px 15px; text-align: left; font-weight: 600; cursor: pointer; border-bottom: 2px solid #ff8c00;" data-sort="frame">Frame</th>
                        <th style="padding: 12px 15px; text-align: left; font-weight: 600; cursor: pointer; border-bottom: 2px solid #ff8c00;" data-sort="rendertime">Render Time</th>
                        <th style="padding: 12px 15px; text-align: left; font-weight: 600; cursor: pointer; border-bottom: 2px solid #ff8c00;" data-sort="cost">Cost</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        topFrames.forEach(frame => {
            tableHTML += `
                <tr style="border-bottom: 1px solid #444; transition: background-color 0.3s;">
                    <td style="padding: 12px 15px; text-align: left; color: #fff;">Frame ${frame.frame}</td>
                    <td style="padding: 12px 15px; text-align: left; color: #fff;">${frame.rendertime}</td>
                    <td style="padding: 12px 15px; text-align: left; color: #fff;">${frame.cost}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
            <button id="showAllFrames" style="margin-top: 15px; padding: 8px 16px; background-color: #ff8c00; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; transition: background-color 0.3s;">Show All Frames</button>
        `;
        
        tableDiv.innerHTML = tableHTML;
        
        const tabWidget = document.querySelector('.widget');
        if (tabWidget) {
            tabWidget.parentNode.insertBefore(tableDiv, tabWidget.nextSibling);
        } else {
            const contentArea = document.querySelector('.col-md-12.tiles');
            if (contentArea) {
                contentArea.parentNode.insertBefore(tableDiv, contentArea.nextSibling);
            }
        }
        
        document.getElementById('showAllFrames').addEventListener('click', function() {
            showAllFramesModal(frames);
        });

        const rows = tableDiv.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseover', () => {
                row.style.backgroundColor = '#3a3a3a';
            });
            row.addEventListener('mouseout', () => {
                row.style.backgroundColor = 'transparent';
            });
        });

        addSorting('statsTable', topFrames);
    }

    function showAllFramesModal(frames) {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'allFramesModal';
        modalContainer.style.cssText = `
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: #1a1a1a;
            padding: 25px;
            border-radius: 10px;
            width: 80%;
            max-width: 900px;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        `;

        const closeButton = document.createElement('span');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            float: right;
            font-size: 28px;
            font-weight: bold;
            color: #ff8c00;
            cursor: pointer;
            transition: color 0.3s;
        `;
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.color = '#fff';
        });
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.color = '#ff8c00';
        });
        closeButton.onclick = function() {
            document.body.removeChild(modalContainer);
        };

        let allFramesTable = `
            <div style="margin-bottom: 15px; font-weight: bold; font-size: 20px; color: #ff8c00;">All Frames by Render Time</div>
            <table style="width: 100%; border-collapse: collapse; background-color: #2a2a2a; border-radius: 8px; overflow: hidden;" id="allFramesTable">
                <thead>
                    <tr style="background-color: #3a3a3a; color: #ff8c00;">
                        <th style="padding: 12px 15px; text-align: left; font-weight: 600; cursor: pointer; border-bottom: 2px solid #ff8c00;" data-sort="frame">Frame</th>
                        <th style="padding: 12px 15px; text-align: left; font-weight: 600; cursor: pointer; border-bottom: 2px solid #ff8c00;" data-sort="rendertime">Render Time</th>
                        <th style="padding: 12px 15px; text-align: left; font-weight: 600; cursor: pointer; border-bottom: 2px solid #ff8c00;" data-sort="cost">Cost</th>
                    </tr>
                </thead>
                <tbody>
        `;

        frames.forEach(frame => {
            allFramesTable += `
                <tr style="border-bottom: 1px solid #444; transition: background-color 0.3s;">
                    <td style="padding: 12px 15px; text-align: left; color: #fff;">Frame ${frame.frame}</td>
                    <td style="padding: 12px 15px; text-align: left; color: #fff;">${frame.rendertime}</td>
                    <td style="padding: 12px 15px; text-align: left; color: #fff;">${frame.cost}</td>
                </tr>
            `;
        });

        allFramesTable += `
                </tbody>
            </table>
        `;

        modalContent.appendChild(closeButton);
        modalContent.innerHTML += allFramesTable;
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);

        window.onclick = function(event) {
            if (event.target === modalContainer) {
                document.body.removeChild(modalContainer);
            }
        };

        const modalRows = modalContent.querySelectorAll('tbody tr');
        modalRows.forEach(row => {
            row.addEventListener('mouseover', () => {
                row.style.backgroundColor = '#3a3a3a';
            });
            row.addEventListener('mouseout', () => {
                row.style.backgroundColor = 'transparent';
            });
        });

        addSorting('allFramesTable', frames);
    }

    function addSorting(tableId, framesData) {
        const table = document.getElementById(tableId);
        const headers = table.querySelectorAll('th');
        let sortDirection = {};

        headers.forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.getAttribute('data-sort');
                sortDirection[sortKey] = !sortDirection[sortKey];

                const sortedFrames = [...framesData].sort((a, b) => {
                    let comparison = 0;
                    switch(sortKey) {
                        case 'frame':
                            comparison = a.frame - b.frame;
                            break;
                        case 'rendertime':
                            comparison = a.rendertimeSeconds - b.rendertimeSeconds;
                            break;
                        case 'cost':
                            comparison = a.cost - b.cost;
                            break;
                    }
                    return sortDirection[sortKey] ? comparison : -comparison;
                });

                const tbody = table.querySelector('tbody');
                tbody.innerHTML = '';

                sortedFrames.forEach(frame => {
                    const row = document.createElement('tr');
                    row.style.cssText = 'border-bottom: 1px solid #444; transition: background-color 0.3s;';
                    row.innerHTML = `
                        <td style="padding: 12px 15px; text-align: left; color: #fff;">Frame ${frame.frame}</td>
                        <td style="padding: 12px 15px; text-align: left; color: #fff;">${frame.rendertime}</td>
                        <td style="padding: 12px 15px; text-align: left; color: #fff;">${frame.cost}</td>
                    `;
                    tbody.appendChild(row);

                    row.addEventListener('mouseover', () => {
                        row.style.backgroundColor = '#3a3a3a';
                    });
                    row.addEventListener('mouseout', () => {
                        row.style.backgroundColor = 'transparent';
                    });
                });
            });
        });
    }

    // Redesign and add renderer count to Summary section as a table
    function redesignSummary(rendererCount) {
        const summaryDiv = document.querySelector('.w-box.blog-post');
        if (summaryDiv) {
            summaryDiv.style.cssText = `
                background-color: #1a1a1a;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                color: #fff;
                font-family: Arial, sans-serif;
            `;

            const h2 = summaryDiv.querySelector('h2');
            if (h2) {
                h2.style.cssText = `
                    color: #ff8c00;
                    font-size: 24px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #ff8c00;
                    padding-bottom: 5px;
                `;
            }

            const ul = summaryDiv.querySelector('ul');
            if (ul) {
                const table = document.createElement('table');
                table.style.cssText = `
                    width: 100%;
                    border-collapse: collapse;
                    background-color: #2a2a2a;
                    border-radius: 8px;
                    overflow: hidden;
                `;

                const tbody = document.createElement('tbody');
                const liElements = ul.querySelectorAll('li');
                liElements.forEach(li => {
                    const row = document.createElement('tr');
                    row.style.cssText = `
                        border-bottom: 1px solid #444;
                        transition: background-color 0.3s;
                    `;
                    const labelCell = document.createElement('td');
                    const valueCell = document.createElement('td');

                    labelCell.style.cssText = `
                        padding: 12px 15px;
                        text-align: left;
                        color: #ff8c00;
                        font-weight: 600;
                    `;
                    valueCell.style.cssText = `
                        padding: 12px 15px;
                        text-align: left;
                        color: #fff;
                    `;

                    const text = li.textContent.trim();
                    if (text.includes('The project will be done in')) {
                        labelCell.textContent = 'Completion Time:';
                        valueCell.textContent = text.replace('The project will be done in ', '');
                    } else if (text.includes('Storage used:')) {
                        labelCell.textContent = 'Storage Used:';
                        valueCell.textContent = text.replace('Storage used: ', '');
                    } else if (text.includes('Cumulated time of render:')) {
                        labelCell.textContent = 'Cumulated Render Time:';
                        valueCell.textContent = text.replace('Cumulated time of render: ', '');
                    } else if (text.includes('Points spent:')) {
                        labelCell.textContent = 'Points Spent:';
                        valueCell.textContent = text.replace('Points spent: ', '');
                    } else if (text.includes('On reference per frame rendertime:')) {
                        labelCell.textContent = 'Per Frame Rendertime:';
                        valueCell.innerHTML = li.innerHTML.replace('On reference per frame rendertime: ', '');
                    } else if (text.includes('Statistics about the render')) {
                        labelCell.textContent = 'Render Statistics:';
                        valueCell.innerHTML = li.innerHTML;
                    } else if (text.includes('RAM usage:')) {
                        labelCell.textContent = 'RAM Usage:';
                        valueCell.textContent = text.replace('RAM usage: ', '');
                    }

                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    tbody.appendChild(row);

                    row.addEventListener('mouseover', () => {
                        row.style.backgroundColor = '#3a3a3a';
                    });
                    row.addEventListener('mouseout', () => {
                        row.style.backgroundColor = 'transparent';
                    });
                });

                const rendererRow = document.createElement('tr');
                rendererRow.style.cssText = `
                    border-bottom: 1px solid #444;
                    transition: background-color 0.3s;
                `;
                const rendererLabelCell = document.createElement('td');
                const rendererValueCell = document.createElement('td');

                rendererLabelCell.style.cssText = `
                    padding: 12px 15px;
                    text-align: left;
                    color: #ff8c00;
                    font-weight: 600;
                `;
                rendererValueCell.style.cssText = `
                    padding: 12px 15px;
                    text-align: left;
                    color: #fff;
                    margin: 0 5px;
                `;

                rendererLabelCell.textContent = 'Current Renderers:';
                rendererValueCell.innerHTML = `<span style="background-color: #ff8c00; color: #fff; padding: 4px 12px; border-radius: 15px; font-weight: 600;">${rendererCount}</span>`;

                rendererRow.appendChild(rendererLabelCell);
                rendererRow.appendChild(rendererValueCell);
                tbody.appendChild(rendererRow);

                rendererRow.addEventListener('mouseover', () => {
                    rendererRow.style.backgroundColor = '#3a3a3a';
                });
                rendererRow.addEventListener('mouseout', () => {
                    rendererRow.style.backgroundColor = 'transparent';
                });

                table.appendChild(tbody);
                ul.parentNode.replaceChild(table, ul);
            }
        }
    }

    function redesignLegend() {
        const legendWidget = document.querySelector('.widget .categories.legend');
        if (legendWidget) {
            const widget = legendWidget.closest('.widget');
            widget.style.cssText = `
                background-color: #1a1a1a;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                color: #fff;
            `;

            const heading = widget.querySelector('.widget-heading');
            if (heading) {
                heading.style.cssText = `
                    color: #ff8c00;
                    font-size: 20px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #ff8c00;
                    padding-bottom: 5px;
                `;
            }

            legendWidget.style.cssText = `
                list-style: none;
                padding: 0;
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            `;

            const liElements = legendWidget.querySelectorAll('li');
            liElements.forEach(li => {
                li.style.cssText = `
                    padding: 8px 15px;
                    background-color: #2a2a2a;
                    border-radius: 5px;
                    transition: background-color 0.3s;
                `;
                const a = li.querySelector('a');
                if (a) {
                    a.style.cssText = `
                        color: #fff;
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    `;
                }
                const span = li.querySelector('.square');
                if (span) {
                    span.style.cssText = `
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        border-radius: 3px;
                    `;
                }
                li.addEventListener('mouseover', () => {
                    li.style.backgroundColor = '#3a3a3a';
                });
                li.addEventListener('mouseout', () => {
                    li.style.backgroundColor = '#2a2a2a';
                });
            });
        }
    }

    function redesignTabs() {
        const tabWidget = document.querySelector('.widget .tabs');
        if (tabWidget) {
            const widget = tabWidget.closest('.widget');
            widget.style.cssText = `
                background-color: #1a1a1a;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                color: #fff;
            `;

            const navTabs = tabWidget.querySelector('.nav-tabs');
            if (navTabs) {
                navTabs.style.cssText = `
                    border-bottom: 2px solid #ff8c00;
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                `;
                const liElements = navTabs.querySelectorAll('li');
                liElements.forEach(li => {
                    li.style.cssText = `
                        margin-bottom: -2px;
                    `;
                    const a = li.querySelector('a');
                    if (a) {
                        a.style.cssText = `
                            color: #fff;
                            background-color: #2a2a2a;
                            padding: 10px 20px;
                            border-radius: 5px 5px 0 0;
                            border: none;
                            transition: background-color 0.3s;
                        `;
                        if (li.classList.contains('active')) {
                            a.style.backgroundColor = '#ff8c00';
                        }
                        a.addEventListener('mouseover', () => {
                            if (!li.classList.contains('active')) {
                                a.style.backgroundColor = '#3a3a3a';
                            }
                        });
                        a.addEventListener('mouseout', () => {
                            if (!li.classList.contains('active')) {
                                a.style.backgroundColor = '#2a2a2a';
                            }
                        });
                    }
                });
            }

            const tabContent = tabWidget.querySelector('.tab-content');
            if (tabContent) {
                tabContent.style.cssText = `
                    background-color: #2a2a2a;
                    padding: 15px;
                    border-radius: 5px;
                `;

                const h4Elements = tabContent.querySelectorAll('h4');
                h4Elements.forEach(h4 => {
                    h4.style.cssText = `
                        color: #ff8c00;
                        font-size: 18px;
                        margin-bottom: 15px;
                    `;
                });

                const forms = tabContent.querySelectorAll('form');
                forms.forEach(form => {
                    form.style.cssText = `
                        margin-bottom: 15px;
                    `;
                    const inputs = form.querySelectorAll('input[type="checkbox"], input[type="radio"]');
                    inputs.forEach(input => {
                        input.style.cssText = `
                            margin-right: 8px;
                        `;
                    });
                    const labels = form.querySelectorAll('label');
                    labels.forEach(label => {
                        label.style.cssText = `
                            color: #fff;
                            font-weight: 400;
                        `;
                    });
                    const button = form.querySelector('.btn-primary');
                    if (button) {
                        button.style.cssText = `
                            background-color: #ff8c00;
                            border: none;
                            padding: 5px 15px;
                            border-radius: 5px;
                            transition: background-color 0.3s;
                        `;
                        button.addEventListener('mouseover', () => {
                            button.style.backgroundColor = '#e07b00';
                        });
                        button.addEventListener('mouseout', () => {
                            button.style.backgroundColor = '#ff8c00';
                        });
                    }
                });

                const divs = tabContent.querySelectorAll('.tab-pane > div');
                divs.forEach(div => {
                    div.style.cssText = `
                        color: #fff;
                    `;
                    const strong = div.querySelector('strong');
                    if (strong) {
                        strong.style.color = '#ff8c00';
                    }
                    const imgs = div.querySelectorAll('img');
                    imgs.forEach(img => {
                        img.style.cssText = `
                            vertical-align: middle;
                            margin-right: 5px;
                        `;
                    });
                });
            }
        }
    }

    function redesignProjectInfo() {
        const projectRow = document.querySelector('.row .col-md-8');
        if (projectRow) {
            const container = projectRow.closest('.row');
            container.style.cssText = `
                background-color: #1a1a1a;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                margin-bottom: 20px;
            `;

            const h2 = projectRow.querySelector('h2');
            if (h2) {
                h2.style.cssText = `
                    color: #ff8c00;
                    font-size: 24px;
                    margin-bottom: 15px;
                `;
            }

            const metaList = projectRow.querySelector('.meta-list');
            if (metaList) {
                metaList.style.cssText = `
                    list-style: none;
                    padding: 0;
                    display: flex;
                    gap: 20px;
                    color: #fff;
                `;
                const liElements = metaList.querySelectorAll('li');
                liElements.forEach(li => {
                    li.style.cssText = `
                        background-color: #2a2a2a;
                        padding: 8px 15px;
                        border-radius: 5px;
                        transition: background-color 0.3s;
                    `;
                    if (li.classList.contains('msg_processing')) {
                        li.style.color = '#ff8c00';
                        li.style.fontWeight = '600';
                    }
                    li.addEventListener('mouseover', () => {
                        li.style.backgroundColor = '#3a3a3a';
                    });
                    li.addEventListener('mouseout', () => {
                        li.style.backgroundColor = '#2a2a2a';
                    });
                });
            }

            const actionsDiv = container.querySelector('.col-md-4.text-right');
            if (actionsDiv) {
                actionsDiv.style.cssText = `
                    padding: 15px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                `;
                const buttons = actionsDiv.querySelectorAll('.btn');
                buttons.forEach(btn => {
                    btn.style.cssText = `
                        background-color: #2a2a2a;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 50%;
                        transition: background-color 0.3s;
                    `;
                    if (btn.classList.contains('btn-neutral')) {
                        btn.style.backgroundColor = '#4CAF50';
                    } else if (btn.classList.contains('btn-success')) {
                        btn.style.backgroundColor = '#2196F3';
                    } else if (btn.classList.contains('btn-warning')) {
                        btn.style.backgroundColor = '#ff8c00';
                    } else if (btn.classList.contains('btn-danger')) {
                        btn.style.backgroundColor = '#F44336';
                    }
                    btn.addEventListener('mouseover', () => {
                        btn.style.backgroundColor = btn.style.backgroundColor === 'rgb(76, 175, 80)' ? '#388E3C' :
                            btn.style.backgroundColor === 'rgb(33, 150, 243)' ? '#1976D2' :
                            btn.style.backgroundColor === 'rgb(255, 140, 0)' ? '#e07b00' : '#D32F2F';
                    });
                    btn.addEventListener('mouseout', () => {
                        btn.style.backgroundColor = btn.classList.contains('btn-neutral') ? '#4CAF50' :
                            btn.classList.contains('btn-success') ? '#2196F3' :
                            btn.classList.contains('btn-warning') ? '#ff8c00' : '#F44336';
                    });
                });
            }
        }
    }

    const frameData = extractFrameData();
    if (frameData.length > 0) {
        frameData.sort((a, b) => b.rendertimeSeconds - a.rendertimeSeconds);
        createTable(frameData);
        const rendererCount = getRendererCount();
        redesignSummary(rendererCount);
        redesignLegend();
        redesignTabs();
        redesignProjectInfo();
        displayRandomThumbnails();
        startCountdown();
    }
}