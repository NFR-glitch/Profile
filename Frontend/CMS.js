async function loadArticles() {
    try {
        console.log("Fetching from:", API);

        const res = await fetch(API);

        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
        }

        const data = await res.json();

        console.log("Data dari API:", data);

        articles = data;

        renderDashboard();
        renderArticleList();

    } catch (err) {
        console.error("FETCH ERROR:", err);
    }
}