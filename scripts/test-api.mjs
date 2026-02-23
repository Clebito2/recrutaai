async function test() {
    try {
        const body = {
            companyName: "Test",
            cvContent: "test cv content",
            profileLevel: "tecnico"
        };
        const res = await fetch("http://localhost:3002/api/analyze-candidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test script error:", e);
    }
}
test();
