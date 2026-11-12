
const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("search-btn");
const profileContainer = document.getElementById("profile-container");
const repositoriesList = document.getElementById("repositories-list");

// Search button click
searchButton.addEventListener("click", searchUser);

// Enter key support
usernameInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchUser();
    }
});

async function searchUser() {
    const username = usernameInput.value.trim();

    if (username === "") {
        profileContainer.textContent = "Please enter a GitHub username.";
        repositoriesList.replaceChildren();
        return;
    }

    // Loading state
    profileContainer.textContent = "Loading profile...";
    repositoriesList.textContent = "Loading repositories...";

    searchButton.disabled = true;
    searchButton.textContent = "Searching...";

    try {
        // Fetch user profile
        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
        );

        if (!response.ok) {
            throw new Error("User not found!");
        }

        const userData = await response.json();

        // Fetch user repositories
        const repoResponse = await fetch(userData.repos_url);

        if (!repoResponse.ok) {
            throw new Error("Could not load repositories.");
        }

        const repoData = await repoResponse.json();

        // Create profile elements
        profileContainer.replaceChildren();

        const avatar = document.createElement("img");
        avatar.src = userData.avatar_url;
        avatar.alt = "GitHub profile picture";
        avatar.width = 100;

        const name = document.createElement("h2");
        name.textContent = userData.name || userData.login;

        const bio = document.createElement("p");
        bio.textContent = userData.bio || "No bio available.";

        const followers = document.createElement("p");
        followers.textContent = `Followers: ${userData.followers}`;

        const following = document.createElement("p");
        following.textContent = `Following: ${userData.following}`;

        const repositories = document.createElement("p");
        repositories.textContent =
            `Public Repositories: ${userData.public_repos}`;

        const profileLink = document.createElement("a");
        profileLink.href = userData.html_url;
        profileLink.textContent = "View GitHub Profile";
        profileLink.target = "_blank";
        profileLink.rel = "noopener noreferrer";

        profileContainer.append(
            avatar,
            name,
            bio,
            followers,
            following,
            repositories,
            profileLink
        );

        // Display repository cards
        repositoriesList.replaceChildren();

        if (repoData.length === 0) {
            repositoriesList.textContent = "No public repositories found.";
        }

        repoData
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5)
            .forEach(repo => {
            
            const card = document.createElement("div");
            card.className = "repo-card";

            const title = document.createElement("h3");
            title.textContent = repo.name;

            const description = document.createElement("p");
            description.textContent =
                repo.description || "No description available.";

            const language = document.createElement("p");
            const topics = document.createElement("p");
                topics.textContent = `Topics: ${
                repo.topics.length > 0
                ? repo.topics.join(", ")
                : "No topics available"
            }`;
            
            language.textContent =
                `Language: ${repo.language || "Not specified"}`;
            
            const stars = document.createElement("p");
                stars.textContent = `⭐ Stars: ${repo.stargazers_count}`;

            const forks = document.createElement("p");
            forks.textContent = `🍴 Forks: ${repo.forks_count}`;

            const link = document.createElement("a");
            link.href = repo.html_url;
            link.textContent = "View Repository";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            card.append(title, description, language, link);

            repositoriesList.appendChild(card);
        });

    } catch (error) {
        profileContainer.textContent = error.message;
        repositoriesList.textContent =
            "Could not load repositories.";
    }

    finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}
