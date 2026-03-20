/* lanyard config */
const DISCORD_ID = "659243656888188928";
const trackText = document.getElementById('track-name');
const activityLabel = document.getElementById('activity-label');
const moodText = document.getElementById('current-mood');
const dot = document.getElementById('status-dot');
const musicCard = document.getElementById('status-card');
const iconSlot = document.getElementById('activity-icon-slot');

/* initialize lucide icons */
lucide.createIcons();

async function getLanyardData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const json = await response.json();
        
        if (json.success) {
            const data = json.data;
            const activities = data.activities || [];
            
            /* 1. update status dot color */
            const statusColors = {
                online: '#22c55e',
                idle: '#facc15',
                dnd: '#ef4444',
                offline: '#4b5563'
            };
            const color = statusColors[data.discord_status] || statusColors.offline;
            dot.style.background = color;
            dot.style.boxShadow = `0 0 12px ${color}`;

            /* 2. setup activity & time variables */
            const vscode = activities.find(a => a.name === "Visual Studio Code" || a.application_id === "383226320970055681");
            const game = activities.find(a => a.type === 0 && a.name !== "Visual Studio Code"); 
            const spotify = data.listening_to_spotify ? data.spotify : null;

            const malaysiaTime = new Intl.DateTimeFormat('en-GB', {
                hour: 'numeric',
                hour12: false,
                timeZone: 'Asia/Kuala_Lumpur'
            }).format(new Date());

            const now = new Date();
            const day = now.getDay();
            const hour = parseInt(malaysiaTime);
            
            // working time monday-F=friday, 8am-5pm
            const isWorkingHours = (day >= 1 && day <= 3) && (hour >= 8 && hour < 17);

            /* 3. handle presence with logic overrides */

            // Priority 1: Coding (VS Code)
            if (vscode) {
                moodText.innerText = "coding 💻";
                activityLabel.innerText = "currently:";
                trackText.innerText = vscode.details || "random coding project";
                updateActivityImage(vscode);
                musicCard.classList.add('playing');
            }
            // Priority 2: Gaming
            else if (game) {
                moodText.innerText = "gaming 🎮";
                activityLabel.innerText = "playing:";
                trackText.innerText = game.name;
                updateActivityImage(game);
                musicCard.classList.add('playing');
            } 
            // Priority 3: Spotify
            else if (spotify) {
                moodText.innerText = isWorkingHours ? "sneaking 🤫" : "chilling ☕";
                activityLabel.innerText = "listening to:";
                trackText.innerText = `${spotify.song} - ${spotify.artist}`;
                iconSlot.innerHTML = `<img src="${spotify.album_art_url}" style="width:40px; height:40px; border-radius:10px; object-fit:cover;">`;
                musicCard.classList.add('playing');
            } 
            // Priority 4: Fallbacks (No Activity)
            else {
                let iconName = "coffee";

                if (data.discord_status === 'offline') {
                    if (isWorkingHours) {
                        moodText.innerText = "working irl 📁";
                        trackText.innerText = "busy with real life stuff";
                        iconName = "briefcase";
                    } else {
                        moodText.innerText = "asleep 😴";
                        trackText.innerText = "probably dreaming";
                        iconName = "moon";
                    }
                } else if (isWorkingHours) {
                    moodText.innerText = "sneaking 🤫";
                    trackText.innerText = "supposed to be working irl";
                    iconName = "ghost";
                } else {
                    moodText.innerText = data.discord_status === 'idle' ? "away 🌙" : "chilling ☕";
                    trackText.innerText = data.discord_status === 'idle' ? "taking a quick break" : "just browsing around";
                    iconName = "coffee";
                }

                activityLabel.innerText = "currently:";
                iconSlot.innerHTML = `<i data-lucide="${iconName}" class="spotify-icon"></i>`;
                lucide.createIcons();
                musicCard.classList.remove('playing');
            }
        }
    } catch (error) {
        console.error("connection error:", error);
    }
}

function updateActivityImage(activity) {
    if (activity.assets && activity.assets.large_image) {
        let appId = activity.application_id;
        let imageId = activity.assets.large_image;
        let url = "";

        if (imageId.startsWith("mp:external")) {
            url = imageId.replace(/mp:external\/.*?\/(https?)\//, '$1://');
        } else {
            url = `https://cdn.discordapp.com/app-assets/${appId}/${imageId}.png`;
        }
        
        iconSlot.innerHTML = `<img src="${url}" style="width:40px; height:40px; border-radius:10px; object-fit:cover;">`;
    } else {
        const iconName = activity.name === "Visual Studio Code" ? "code-2" : "gamepad-2";
        iconSlot.innerHTML = `<i data-lucide="${iconName}" class="spotify-icon"></i>`;
        lucide.createIcons();
    }
}

getLanyardData();
setInterval(getLanyardData, 10000);
