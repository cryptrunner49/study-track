// server/api/other-content.get.js
export default defineEventHandler(() => {
    // Mock data for other content
    const otherContent = [
        { contentId: 1, title: "Content 1", type: "video", link: "https://example.com" },
        { contentId: 2, title: "Content 2", type: "course", link: "https://example.com" },
    ];
    return otherContent;
});