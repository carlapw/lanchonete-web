"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Bike, Check, Minus, Plus, Search, ShoppingCart, Trash2, Utensils, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import MENU from "@/data/menu";



const RAW_PHONE = process.env.NEXT_PUBLIC_WHATSAPP ?? "";
const DELIVERY_FEE_RAW = process.env.NEXT_PUBLIC_DELIVERY_FEE ?? "6";

const MODOS: Customer["modo"][] = ["Retirada", "Entrega"];
const PAGAMENTOS: Customer["pagamento"][] = ["PIX", "Dinheiro", "Cartão"];

const WHATSAPP_PHONE = RAW_PHONE.replace(/\D/g, ""); 
const DELIVERY_FEE = Number(DELIVERY_FEE_RAW || 0);


const AREAS = [
  { id: "lagoa",    nome: "Lagoa",    km: 0,  taxa: "" },
  { id: "vereda",    nome: "Vereda",    km: 4,  taxa: 4 },
  { id: "canabrava", nome: "Canabrava", km: 5,  taxa: 5 },
  { id: "almeida",   nome: "Almeida",   km: 9,  taxa: 8 },
  { id: "sao-tome",  nome: "São Tomé",  km: 13, taxa: 10 },
] as const;

function areaById(id?: string) {
  return AREAS.find((a) => a.id === id);
}

function canDeliver(c: Customer) {
  if (c.modo !== "Entrega") return true;      
  if (!c.localidade) return false;             
  return !!areaById(c.localidade);            
}

function deliveryFee(c: Customer) {
  if (c.modo !== "Entrega") return 0;
  const a = areaById(c.localidade);

  return a ? a.taxa : 0;
}


const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


type CartLine = { id: string | number; qty: number };

type Customer = {
  nome: string;
  telefone: string;
  modo: "Retirada" | "Entrega";
  endereco?: string;
  pagamento: "PIX" | "Dinheiro" | "Cartão";
  troco?: string;
  obs?: string;
  localidade?: string;
};

const useLocal = <T,>(key: string, initial: T) => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
};

export default function LanchonetePedidos() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todos");
  const [cart, setCart] = useLocal<CartLine[]>("cart", []);
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useLocal<Customer>("customer", {
    nome: "",
    telefone: "",
    modo: "Retirada",
    pagamento: "PIX",
    localidade: "",
  });

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(MENU.map((i) => i.category)))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MENU.filter(
      (i) =>
        (category === "Todos" || i.category === category) &&
        (!q || i.name.toLowerCase().includes(q))
    );
  }, [query, category]);

 
  const MENU_BY_ID = useMemo(() => new Map(MENU.map((m) => [String(m.id), m])), []);

  
  useEffect(() => {
  setCart((prev) => prev.filter((l) => MENU_BY_ID.has(String(l.id))));
}, [MENU_BY_ID, setCart]);


  const add = (id: string | number) =>
    setCart((prev) => {
      const item = MENU_BY_ID.get(String(id));
      if (item && item.available === false) {
        alert(`${item.name} está esgotado no momento.`);
        return prev;
      }
      const found = prev.find((l) => String(l.id) === String(id));
      if (found) return prev.map((l) => (String(l.id) === String(id) ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { id: String(id), qty: 1 }];
    });

  const dec = (id: string | number) =>
    setCart((prev) =>
      prev.flatMap((l) =>
        String(l.id) === String(id) ? (l.qty <= 1 ? [] : [{ ...l, qty: l.qty - 1 }]) : [l]
      )
    );

  const remove = (id: string | number) =>
    setCart((prev) => prev.filter((l) => String(l.id) !== String(id)));

  const clear = () => setCart([]);

  type MenuItem = (typeof MENU)[number];
  type CartLineFull = CartLine & { item: MenuItem };

  const cartLines = useMemo<CartLineFull[]>(
    () =>
      cart
        .map((l): CartLineFull | null => {
          const item = MENU_BY_ID.get(String(l.id));
          return item ? ({ ...l, item } as CartLineFull) : null;
        })
        .filter((x): x is CartLineFull => x !== null),
    [cart, MENU_BY_ID]
  );

  const subtotal = useMemo(
    () => cartLines.reduce((acc, l) => acc + l.item.price * l.qty, 0),
    [cartLines]
  );

  const taxaEntrega = deliveryFee(customer);

  const total = subtotal + taxaEntrega;

function handleSubmit() {
  if (!customer.nome || !customer.telefone) {
    alert("Preencha nome e telefone.");
    return;
  }
  if (customer.modo === "Entrega" && !customer.endereco) {
    alert("Informe o endereço para entrega.");
    return;
  }
  if (!canDeliver(customer)) {
    alert("Desculpe, ainda não entregamos nessa localidade.");
    return;
  }
  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }
  if (cartLines.some((l) => l.item.available === false)) {
    alert("Há itens esgotados no carrinho. Remova-os para finalizar.");
    return;
  }

  const area = areaById(customer.localidade);
  const linhas = cartLines
    .map((l) => `${l.qty}x ${l.item.name} — R$ ${fmt(l.item.price)}`)
    .join("\n");

  const resumo = `*Pedido da Lanchonete*\n
Cliente: ${customer.nome}
Telefone: ${customer.telefone}
Modo: ${customer.modo}
${customer.modo === "Entrega" ? `Localidade: ${area ? `${area.nome} (${area.km} km)` : "—"}\nEndereço: ${customer.endereco}\n` : ""}
Pagamento: ${customer.pagamento}${customer.pagamento === "Dinheiro" && customer.troco ? ` (troco para ${customer.troco})` : ""}

Itens:
${linhas}

Subtotal: R$ ${fmt(subtotal)}
Taxa entrega: R$ ${fmt(taxaEntrega)}
*Total: R$ ${fmt(total)}*

Obs: ${customer.obs ?? "-"}`;

  if (!WHATSAPP_PHONE) {
    alert("Número do WhatsApp não configurado.");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(resumo)}`;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) win.opener = null;
}


 
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <div className="flex items-center gap-3">
    <div className="size-10 rounded-2xl bg-muted flex items-center justify-center shadow">
      <Utensils className="size-5" />
    </div>
    <div>
      <h1 className="text-2xl font-bold leading-tight">Mix da Praça</h1>
      <p className="text-sm text-muted-foreground">Pedidos online — rápido e fácil</p>
    </div>
  </div>

  
  <div className="flex items-center gap-2 w-full md:w-auto">
    <div className="relative flex-1 min-w-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        className="pl-9 w-full"           
        placeholder="Buscar no cardápio…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>

    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="default" className="gap-2 shrink-0">
          <ShoppingCart className="size-4" />
          <span className="hidden sm:inline">Carrinho</span> 
          {cart.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {cart.reduce((a, b) => a + b.qty, 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

     
      <SheetContent side="right" className="w-[100vw] sm:max-w-sm p-0 flex flex-col">
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <SheetTitle>Seu carrinho</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="-mr-1">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
      </SheetHeader>


        <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {cartLines.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Nenhum item no carrinho.</p>
              <SheetClose asChild>
                <Button>Voltar ao cardápio</Button>
              </SheetClose>
            </div>
          )}


          {cartLines.map((l) => {
            const out = l.item.available === false
            return (
              <Card key={String(l.id)}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {l.item.image && (
                        <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={l.item.image}
                            alt={l.item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {l.item.name}
                          {out && (
                            <span className="ml-2 rounded-full bg-red-100 text-red-700 text-[10px] px-2 py-0.5 align-middle">
                              Esgotado
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">R$ {fmt(l.item.price)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => dec(l.id)}>
                        <Minus className="size-4" />
                      </Button>
                      <div className="w-8 text-center select-none">{l.qty}</div>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={() => add(l.id)}
                        disabled={out}
                        title={out ? "Item esgotado" : "Adicionar"}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between md:block">
                      <div className="font-medium">R$ {fmt(l.item.price * l.qty)}</div>
                      {out && <div className="text-xs text-red-600">Esgotado</div>}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2 md:ml-0"
                        onClick={() => remove(l.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {cartLines.length > 0 && (
          <div className="border-t bg-background p-4 space-y-3 sticky bottom-0">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de entrega</span>
                <span>R$ {fmt(taxaEntrega)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>R$ {fmt(total)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clear} className="w-1/3">
                Limpar
              </Button>
              <Button className="w-2/3" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  </div>
</header>


      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            onClick={() => setCategory(cat)}
            className="rounded-2xl"
          >
            {cat}
          </Button>
        ))}
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((item) => {
          const isOut = item.available === false;
          return (
            <Card key={String(item.id)} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.name}</CardTitle>
                {item.desc && (
                  <p
                    className="text-sm text-muted-foreground mt-1"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.desc}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {item.image ? (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-muted">
                    {isOut && (
                      <span className="absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-medium bg-black/80 text-white">
                        Esgotado
                      </span>
                    )}
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className={`object-cover ${isOut ? "opacity-60" : ""}`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-xl bg-muted mb-3" />
                )}

                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">R$ {fmt(item.price)}</div>
                  <Button onClick={() => add(item.id)} className="gap-2" disabled={isOut}>
                    {isOut ? "Esgotado" : (
                      <>
                        <Plus className="size-4" /> Adicionar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Separator className="my-8" />

      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="size-5" /> Entrega ou retirada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              
                {MODOS.map((m) => (
                  <Button
                    key={m}
                    variant={customer.modo === m ? "default" : "outline"}
                    onClick={() => setCustomer({ ...customer, modo: m })}
                  >
                    {m}
                  </Button>
                ))}

            </div>
            {customer.modo === "Entrega" && (
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, número, bairro"
                      value={customer.endereco ?? ""}
                      onChange={(e) => setCustomer({ ...customer, endereco: e.target.value })}
                    />

                    <Label htmlFor="localidade">Localidade (povoado)</Label>
                    <select
                      id="localidade"
                      value={customer.localidade ?? ""}
                      onChange={(e) => setCustomer({ ...customer, localidade: e.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecione…</option>
                      {AREAS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nome} — {a.km} km (taxa R$ {fmt(a.taxa)})
                        </option>
                      ))}
                      <option value="__outro">Outro (não atendido)</option>
                    </select>

                    {!canDeliver(customer) && customer.localidade && (
                      <p className="text-xs text-red-600">
                        No momento não entregamos nessa localidade. Escolha uma das áreas atendidas
                        ou altere para <strong>Retirada</strong>.
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Taxa aplicada: R$ {fmt(taxaEntrega)} (varia por localidade).
                    </p>
                  </div>
                )}

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="size-5" /> Finalizar pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  value={customer.nome}
                  onChange={(e) => setCustomer({ ...customer, nome: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tel">Telefone (WhatsApp)</Label>
                <Input
                  id="tel"
                  placeholder="(00) 00000-0000"
                  value={customer.telefone}
                  onChange={(e) => setCustomer({ ...customer, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {PAGAMENTOS.map((p) => (
                <Button
                  key={p}
                  variant={customer.pagamento === p ? "default" : "outline"}
                  onClick={() => setCustomer({ ...customer, pagamento: p })}
                >
                  {p}
                </Button>
              ))}
            </div>

            {customer.pagamento === "Dinheiro" && (
              <div>
                <Label htmlFor="troco">Troco para</Label>
                <Input
                  id="troco"
                  placeholder="Ex: R$ 50,00"
                  value={customer.troco ?? ""}
                  onChange={(e) => setCustomer({ ...customer, troco: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                placeholder="Sem cebola, ponto da carne, etc."
                value={customer.obs ?? ""}
                onChange={(e) => setCustomer({ ...customer, obs: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-bold">R$ {fmt(total)}</span>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!canDeliver(customer)}>
              Enviar pedido via WhatsApp
            </Button>

          </CardContent>
        </Card>
      </section>

      <footer className="text-xs text-muted-foreground mt-10">
         <p>
          ⚠️ Protótipo local para portfolio. Integrações reais (pagamentos, impressão de comanda, painel de pedidos)
          podem ser adicionadas depois.
        </p>
      </footer>
    </div>
  );
}
