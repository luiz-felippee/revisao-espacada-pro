
export const Terms = () => (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
            <p>Última atualização: {new Date().toLocaleDateString()}</p>
            <p>1. Aceitação: Ao usar o Study Panel, você concorda com estes termos.</p>
            <p>2. Uso Aceitável: Você concorda em não usar o serviço para fins ilegais.</p>
            <p>3. Isenção de Responsabilidade: O serviço é fornecido "como está", sem garantias implícitas.</p>
        </div>
    </div>
);
