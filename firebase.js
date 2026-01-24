async function enviarPagamento(formData) {
    const API_URL = "https://api.mercadopago.com/v1/payments";
    
    // Usando o AllOrigins para contornar o CORS
    const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(API_URL)}`;

    const payload = {
        transaction_amount: formData.transaction_amount,
        token: formData.token,
        description: prodDados.nome,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
            email: formData.payer.email,
            identification: formData.payer.identification,
            entity_type: "individual"
        }
    };

    try {
        const res = await fetch(PROXY_URL, {
            method: "POST", // Note: Alguns proxies exigem que o POST seja simulado
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ACCESS_TOKEN}`, // Token aqui é perigoso!
                    "X-Idempotency-Key": Math.random().toString(36).substring(7)
                },
                body: JSON.stringify(payload)
            })
        });

        // O AllOrigins retorna um objeto com o campo "contents"
        const data = await res.json();
        const result = JSON.parse(data.contents);

        if (result.status === "approved") {
            window.location.href = `sucesso.html?entrega=${encodeURIComponent(prodDados.entrega)}`;
        } else if (result.status === "pending" && result.payment_method_id === "pix") {
            abrirModalPix(result);
        } else {
            alert("Erro: " + (result.message || "Pagamento recusado"));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor de pagamento.");
    }
}