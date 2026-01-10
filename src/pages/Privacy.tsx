
export const Privacy = () => (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
            <p>Última atualização: {new Date().toLocaleDateString()}</p>
            <p>1. Coleta de Dados: Coletamos apenas seu nome, e-mail e dados de estudo para funcionamento do app.</p>
            <p>2. Uso de Dados: Seus dados são usados exclusivamente para fornecer o serviço de revisão espaçada.</p>
            <p>3. Compartilhamento: Não vendemos nem compartilhamos seus dados com terceiros.</p>
        </div>
    </div>
);
