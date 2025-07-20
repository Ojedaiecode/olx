document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-ver-oferta");

    btn.addEventListener("click", async () => {
        try {
            // Obter IP e User-Agent
            const ipRes = await fetch("https://api64.ipify.org?format=json");
            const ipData = await ipRes.json();

            const payload = {
                ip: ipData.ip,
                navegador: navigator.userAgent,
                dataHora: new Date().toLocaleString(),
                titulo: "Camisa esportiva OLX",
                redirecionado: window.location.href
            };

            // Enviar para o Supabase (iremos completar isso depois)
            console.log("Dados coletados:", payload);

            // Redirecionamento após coleta
            window.location.href = "https://www.olx.com.br/";
        } catch (err) {
            console.error("Erro na coleta de dados:", err);
            window.location.href = "https://www.olx.com.br/";
        }
    });
});
