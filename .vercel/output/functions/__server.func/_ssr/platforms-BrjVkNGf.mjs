//#region node_modules/.nitro/vite/services/ssr/assets/platforms-BrjVkNGf.js
var PLATFORMS = [
	{
		id: "github",
		name: "GitHub",
		category: "Code",
		url: (u) => `https://github.com/${u}`,
		live: true
	},
	{
		id: "gitlab",
		name: "GitLab",
		category: "Code",
		url: (u) => `https://gitlab.com/${u}`,
		live: true
	},
	{
		id: "codeberg",
		name: "Codeberg",
		category: "Code",
		url: (u) => `https://codeberg.org/${u}`,
		live: true
	},
	{
		id: "bitbucket",
		name: "Bitbucket",
		category: "Code",
		url: (u) => `https://bitbucket.org/${u}`,
		live: true
	},
	{
		id: "sourceforge",
		name: "SourceForge",
		category: "Code",
		url: (u) => `https://sourceforge.net/u/${u}/profile`,
		live: true
	},
	{
		id: "replit",
		name: "Replit",
		category: "Code",
		url: (u) => `https://replit.com/@${u}`,
		live: true
	},
	{
		id: "codepen",
		name: "CodePen",
		category: "Code",
		url: (u) => `https://codepen.io/${u}`,
		live: true
	},
	{
		id: "npm",
		name: "npm",
		category: "Code",
		url: (u) => `https://www.npmjs.com/~${u}`,
		live: true
	},
	{
		id: "pypi",
		name: "PyPI",
		category: "Code",
		url: (u) => `https://pypi.org/user/${u}/`,
		live: true
	},
	{
		id: "dockerhub",
		name: "Docker Hub",
		category: "Code",
		url: (u) => `https://hub.docker.com/u/${u}`,
		live: true
	},
	{
		id: "huggingface",
		name: "Hugging Face",
		category: "Code",
		url: (u) => `https://huggingface.co/${u}`,
		live: true
	},
	{
		id: "kaggle",
		name: "Kaggle",
		category: "Code",
		url: (u) => `https://www.kaggle.com/${u}`,
		live: true
	},
	{
		id: "crates",
		name: "crates.io",
		category: "Code",
		url: (u) => `https://crates.io/users/${u}`,
		live: true
	},
	{
		id: "reddit",
		name: "Reddit",
		category: "Social",
		url: (u) => `https://www.reddit.com/user/${u}`,
		live: true
	},
	{
		id: "youtube",
		name: "YouTube",
		category: "Social",
		url: (u) => `https://www.youtube.com/@${u}`,
		live: true
	},
	{
		id: "twitch",
		name: "Twitch",
		category: "Social",
		url: (u) => `https://www.twitch.tv/${u}`,
		live: true
	},
	{
		id: "pinterest",
		name: "Pinterest",
		category: "Social",
		url: (u) => `https://www.pinterest.com/${u}/`,
		live: true
	},
	{
		id: "tumblr",
		name: "Tumblr",
		category: "Social",
		url: (u) => `https://${u}.tumblr.com`,
		live: true
	},
	{
		id: "medium",
		name: "Medium",
		category: "Social",
		url: (u) => `https://medium.com/@${u}`,
		live: true
	},
	{
		id: "bsky",
		name: "Bluesky",
		category: "Social",
		url: (u) => `https://bsky.app/profile/${u}`,
		live: true
	},
	{
		id: "mastodon",
		name: "Mastodon",
		category: "Social",
		url: (u) => `https://mastodon.social/@${u}`,
		live: true
	},
	{
		id: "threads",
		name: "Threads",
		category: "Social",
		url: (u) => `https://www.threads.net/@${u}`,
		live: false
	},
	{
		id: "x",
		name: "X",
		category: "Social",
		url: (u) => `https://x.com/${u}`,
		live: false
	},
	{
		id: "instagram",
		name: "Instagram",
		category: "Social",
		url: (u) => `https://www.instagram.com/${u}/`,
		live: false
	},
	{
		id: "tiktok",
		name: "TikTok",
		category: "Social",
		url: (u) => `https://www.tiktok.com/@${u}`,
		live: false
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		category: "Social",
		url: (u) => `https://www.linkedin.com/in/${u}`,
		live: false
	},
	{
		id: "facebook",
		name: "Facebook",
		category: "Social",
		url: (u) => `https://www.facebook.com/${u}`,
		live: false
	},
	{
		id: "hn",
		name: "Hacker News",
		category: "Community",
		url: (u) => `https://news.ycombinator.com/user?id=${u}`,
		live: true
	},
	{
		id: "devto",
		name: "Dev.to",
		category: "Community",
		url: (u) => `https://dev.to/${u}`,
		live: true
	},
	{
		id: "hashnode",
		name: "Hashnode",
		category: "Community",
		url: (u) => `https://hashnode.com/@${u}`,
		live: true
	},
	{
		id: "keybase",
		name: "Keybase",
		category: "Community",
		url: (u) => `https://keybase.io/${u}`,
		live: true
	},
	{
		id: "producthunt",
		name: "Product Hunt",
		category: "Community",
		url: (u) => `https://www.producthunt.com/@${u}`,
		live: true
	},
	{
		id: "stackoverflow",
		name: "Stack Overflow",
		category: "Community",
		url: (u) => `https://stackoverflow.com/users/${u}`,
		live: false
	},
	{
		id: "dribbble",
		name: "Dribbble",
		category: "Creative",
		url: (u) => `https://dribbble.com/${u}`,
		live: true
	},
	{
		id: "behance",
		name: "Behance",
		category: "Creative",
		url: (u) => `https://www.behance.net/${u}`,
		live: true
	},
	{
		id: "deviantart",
		name: "DeviantArt",
		category: "Creative",
		url: (u) => `https://www.deviantart.com/${u}`,
		live: true
	},
	{
		id: "flickr",
		name: "Flickr",
		category: "Creative",
		url: (u) => `https://www.flickr.com/people/${u}`,
		live: true
	},
	{
		id: "vimeo",
		name: "Vimeo",
		category: "Creative",
		url: (u) => `https://vimeo.com/${u}`,
		live: true
	},
	{
		id: "soundcloud",
		name: "SoundCloud",
		category: "Creative",
		url: (u) => `https://soundcloud.com/${u}`,
		live: true
	},
	{
		id: "bandcamp",
		name: "Bandcamp",
		category: "Creative",
		url: (u) => `https://bandcamp.com/${u}`,
		live: true
	},
	{
		id: "lastfm",
		name: "Last.fm",
		category: "Creative",
		url: (u) => `https://www.last.fm/user/${u}`,
		live: true
	},
	{
		id: "steam",
		name: "Steam",
		category: "Other",
		url: (u) => `https://steamcommunity.com/id/${u}`,
		live: true
	},
	{
		id: "aboutme",
		name: "About.me",
		category: "Other",
		url: (u) => `https://about.me/${u}`,
		live: true
	},
	{
		id: "patreon",
		name: "Patreon",
		category: "Other",
		url: (u) => `https://www.patreon.com/${u}`,
		live: true
	},
	{
		id: "telegram",
		name: "Telegram",
		category: "Other",
		url: (u) => `https://t.me/${u}`,
		live: true
	},
	{
		id: "wikipedia",
		name: "Wikipedia",
		category: "Other",
		url: (u) => `https://en.wikipedia.org/wiki/User:${u}`,
		live: true
	}
];
var LIVE_PLATFORMS = PLATFORMS.filter((p) => p.live);
var PIVOT_PLATFORMS = PLATFORMS.filter((p) => !p.live);
//#endregion
export { PIVOT_PLATFORMS as n, LIVE_PLATFORMS as t };
