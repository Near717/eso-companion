import { server, userId, scope } from './config.js';

/* Helper Functions */

/**
 * Convert a timestamp into a formatted date string.
 * @param {string} format - The format string for the output date. 
 *                          Supported format specifiers: %y, %m, %d, %H, %M, %S.
 * @param {number} timestamp - The timestamp to convert (in milliseconds since January 1, 1970).
 * @returns {string} The formatted date string.
 */
export function formatTimestamp(format, timestamp) {
	var date = new Date(timestamp * 1000);

	// Define the replacements for each format specifier
	var replacements = {
		'%y': date.getFullYear(),
		'%m': date.getMonth() + 1, // Months are zero-based
		'%d': date.getDate(),
		'%H': date.getHours(),
		'%M': date.getMinutes(),
		'%S': date.getSeconds()
	};

	// Replace each format specifier with its corresponding value
	var formattedDate = format.replace(/%[ymdHMS]/g, function (match) {
		return replacements[match] < 10 ? '0' + replacements[match] : replacements[match];
	});

	return formattedDate;
}


/**
 * Checks if the given data has been updated within the last 24 hours, considering a daily update cycle starting at 7:00 AM.
 * @param {Object} data - The data object containing the last updated timestamp.
 * @param {boolean} weekly - If data has weekly reset instead of daily.
 * @returns {boolean} Returns true if the data is up to date.
 */
export function isUpdated(data, weekly) {
	// Get the current time
	const currentTime = new Date();

	// Get today's date at 7:00 AM
	const todayAt7AM = new Date(currentTime);
	todayAt7AM.setHours(7, 0, 0, 0);

	// Get yesterday's date at 7:00 AM
	const yesterdayAt7AM = new Date(currentTime);
	yesterdayAt7AM.setDate(yesterdayAt7AM.getDate() - 1);
	yesterdayAt7AM.setHours(7, 0, 0, 0);

	// Convert the updated timestamp to a Date object
	const lastUpdated = new Date(data.lastUpdated * 1000);

	if (weekly) {
		// Get the most recent Monday at 7:00 AM
		const mondayAt7AM = new Date(currentTime);
		const dayOfWeek = mondayAt7AM.getDay();
		const daysToSubtract = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // If it's Sunday (0), go back 6 days, else back to Monday
		mondayAt7AM.setDate(mondayAt7AM.getDate() - daysToSubtract);
		mondayAt7AM.setHours(7, 0, 0, 0);

		// If today is Monday and it's before 7:00 AM, go back to the previous Monday
		if (dayOfWeek === 1 && currentTime < mondayAt7AM) {
			mondayAt7AM.setDate(mondayAt7AM.getDate() - 7);
		}

		// Check if the last update was after the last Monday at 7:00 AM
		return lastUpdated >= mondayAt7AM && lastUpdated < currentTime;
	} else {
		// Check if the last update meets the criteria
		return (lastUpdated >= todayAt7AM && lastUpdated < currentTime) ||
			(lastUpdated >= yesterdayAt7AM && lastUpdated < todayAt7AM && currentTime.getHours() < 7);
	}
}

/**
 * Updates the specified HTML element with the last updated time based on the provided timestamp,
 * and styles the element accordingly if the data is not considered updated.
 * @param {string} element - The ID of the HTML element to update.
 * @param {string} format - The format in which the timestamp should be displayed (e.g., '%y-%m-%d %H:%M:%S').
 * @param {Object} data - The data object containing the last updated timestamp.
 */
export function createLastUpdated(element, format, data) {
	let time = formatTimestamp(format, data.lastUpdated)
	const lastUpdatedText = `Last updated at: ${time}`;

	const lastUpdatedElement = document.getElementById(element);
	lastUpdatedElement.innerText = lastUpdatedText;
	
	// if (!isUpdated(data)) {
	// 	lastUpdatedElement.classList.add('result', 'stale');
	// }
}


/* index.html */

export function buildEndeavor(jsonData) {
	const data = jsonData[server][userId][scope].account;

	const format = '%m/%d %H:%M';
	const element = 'last_updated_endeavor';
	createLastUpdated(element, format, data);

	const endeavorContainer = document.getElementById('endeavor_container');

	function createLabel(type, progress, progressClass) {
		const title = type === 1 ? 'Daily Endeavors: ' : 'Weekly Endeavors: '
		const label = document.createElement('label');
		label.innerText = title;

		const span = document.createElement('span');
		span.innerText = progress;
		span.classList.add('result', progressClass);

		label.appendChild(span);
		endeavorContainer.appendChild(label);
		endeavorContainer.appendChild(document.createElement('br'));
	}

	// Daily endeavors
	const dailyEndeavors = data.endeavor.daily;
	const dailyCompleteCount = dailyEndeavors.filter(endeavor => endeavor.complete).length;

	if (isUpdated(data)) {
		const dailyLabelText = dailyCompleteCount === 3 ? 'Complete' : `${dailyCompleteCount}/3`;
		const dailyLabelClass = 
			dailyCompleteCount === 3 ? 'progress-100' :
			dailyCompleteCount === 2 ? 'progress-75' :
			dailyCompleteCount === 1 ? 'progress-50' : 'progress-0';
		createLabel(1, dailyLabelText, dailyLabelClass);
	} else {
		createLabel(1, '0/3', 'stale');
	}

	// Weekly endeavors
	const weeklyEndeavors = data.endeavor.weekly;
	const weeklyComplete = weeklyEndeavors.some(endeavor => endeavor.complete);

	if (isUpdated(data, true)) {
		const weeklyLabelText = weeklyComplete ? 'Complete' : 'Incomplete';
		const weeklyLabelColor = weeklyComplete ? 'progress-100' : 'progress-0';
		createLabel(2, weeklyLabelText, weeklyLabelColor);
	} else {
		createLabel(2, 'Incomplete', 'stale');
	}
}

export function buildRiding(jsonData) {
	const charInfo = jsonData[server][userId][scope].account.charInfo;
	const char = jsonData[server][userId][scope].char;

	let allComplete = true;
	const ridingContainer = document.getElementById('riding_container');
	ridingContainer.innerHTML = '';

	charInfo.forEach((character) => {
		const charId = character.charId;
		const charName = character.charName;
		const charData = char[charId];
		const updated = isUpdated(charData);

		if (!updated && charData.riding !== '-') {
			const label = document.createElement('label');
			label.innerText = charName;
			label.classList.add('result', 'progress-0');
			ridingContainer.appendChild(label);
			ridingContainer.appendChild(document.createElement('br'));
			allComplete = false;
		}
	});

	if (allComplete) {
		const label = document.createElement('label');
		label.innerText = 'Complete';
		label.classList.add('result', 'complete');
		ridingContainer.appendChild(label);
		ridingContainer.appendChild(document.createElement('br'));
	}
}

export function buildRewards(jsonData) {
	const data = jsonData[server];

	let allClaimed = true;
	const rewardsContainer = document.getElementById('rewards_container');
	rewardsContainer.innerHTML = '';

	Object.keys(data).forEach((id) => {
		const accountData = data[id].$AccountWide.account.dailyReward;
		const claimed = accountData.claimed;
		const updated = isUpdated(accountData);

		const label = document.createElement('label');
		label.innerText = `${id}`;
		label.classList.add('result', 'login');

		if (!updated || !claimed) {
			label.classList.add('incomplete');
			allClaimed = false;
		} else {
			label.classList.add('complete');
		}

		rewardsContainer.appendChild(label);
		rewardsContainer.appendChild(document.createElement('br'));
	});

	if (allClaimed) {
		rewardsContainer.innerHTML = '';
		const label = document.createElement('label');
		label.textContent = 'Complete';
		label.classList.add('result', 'complete');
		rewardsContainer.appendChild(label);
		rewardsContainer.appendChild(document.createElement('br'));
	}
}
