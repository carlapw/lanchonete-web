import type { MenuItem } from "@/types/menu";

const MENU: MenuItem[] = [
  /*Hambúrgueres*/
  { id: "x-burguer",
    name: "X-Burguer",
    price: 12.0,
    category: "Hambúrgueres",
    image: "/lanches/x-burguer.png",
    desc: "Pão, carne artesanal, queijo, salada, batata palha" },

  { id: "da-casa",
    name: "Da Casa",
    price: 14.0,
    category: "Hambúrgueres",
    image: "/lanches/da-casa.png",
    desc: "Pão, carne artesanal, queijo, salada, molho mix, milho, batata palha" },

  { id: "mix",
    name: "Mix",
    price: 15.0,
    category: "Hambúrgueres",
    image: "/lanches/mix.png",
    desc: "Pão, carne artesanal, 2 queijos, salada, molho mix, milho, batata palha",
    available: true },

  { id: "calaburguer",
    name: "Calaburguer",
    price: 15.0,
    category: "Hambúrgueres",
    image: "/lanches/calaburguer.png",
    desc: "Pão, carne artesanal, queijo, calabresa, salada, molho mix, milho, batata palha" },

  { id: "hexa-burguer",
    name: "Hexa Burguer",
    price: 17.0,
    category: "Hambúrgueres",
    image: "/lanches/hexaburguer2.jpg",
    desc: "Pão, carne artesanal, queijo, bacon, salada, molho mix, milho, batata palha" },

  { id: "big-mix",
    name: "Big Mix",
    price: 20.0,
    category: "Hambúrgueres",
    image: "/lanches/big-mix.png",
    desc: "Pão, carne artesanal, queijo, bacon, calabresa, ovo, salada, molho mix, milho, batata palha" },

  { id: "duplo-mix",
    name: "Duplo Mix",
    price: 25.0,
    category: "Hambúrgueres",
    image: "/lanches/duplo-mix.jpg",
    desc: "Pão, 2 carnes artesanais, 2 queijos, bacon, calabresa, ovo, salada, molho mix, milho, batata palha" },

    /**Pasteis */

  { id: "pastel-carne",
    name: "Pastel de Carne",
    price: 7.0,
    category: "Pastéis",
    image: "/lanches/pastel-carne.png" },

  { id: "pastel-queijo",
    name: "Pastel de Queijo",
    price: 7.0,
    category: "Pastéis",
    image: "/lanches/pastel-queijo.jpeg" },

  { id: "pastel-frango",
    name: "Pastel de Frango",
    price: 7.0,
    category: "Pastéis",
    image: "/lanches/pastel-frango.png" },

  { id: "pastel-calabresa",
    name: "Pastel de Calabresa",
    price: 7.0,
    category: "Pastéis",
    image: "/lanches/pastel-calabresa.png" },

  { id: "pastel-carne-queijo",
    name: "Pastel de Carne com Queijo",
    price: 8.0,
    category: "Pastéis",
    image: "/lanches/pastel-carne-queijo.jpg" },

  { id: "pastel-frango-catupiry",
    name: "Pastel de Frango com Catupiry",
    price: 8.0,
    category: "Pastéis",
    image: "/lanches/pastel-frango-catupiry.png" },

  { id: "pastel-calabresa-queijo",
    name: "Pastel de Calabresa com Queijo",
    price: 8.0,
    category: "Pastéis",
    image: "/lanches/pastel-calabresa-queijo.avif" },

  { id: "pastel-queijo-presunto",
    name: "Pastel de Queijo com Presunto",
    price: 8.0,
    category: "Pastéis",
    image: "/lanches/pastel-queijo-presunto.jpg" },
      
    /*Espetinhos*/

  { id: "Espetinho-de-Carne",
    name: "Espetinho de Carne Tradicional ",
    price: 8.0,
    category: "Espetinhos",
    image: "/lanches/espetinho-carne.jpg", 
    desc: "Com Farofa e Salada" },

  { id: "Espetinho-de-Medalhao",
    name: "Espetinho de Medalhão",
    price: 8.0,
    category: "Espetinhos",
    image: "/lanches/espetinho-medalhao.jpg",
    desc: "Com Farofa e Salada" },

  { id: "Espetinho-de-Tulipa",
    name: "Espetinho de Tulipa",
    price: 8.0,
    category: "Espetinhos",
    image: "/lanches/tulipa.jpg",
    desc: "Com Farofa e Salada" },

    /*''Petiscos*/

  { id: "batata-frita",
    name: "Batata Frita + Catchup",
    price: 10.0,
    category: "Petiscos",
    image: "/lanches/refri.jpg",
    desc: "200 gramas" },

  { id: "batata-frita-Cheddar",
    name: "Batata Frita + Cheddar",
    price: 12.0,
    category: "Petiscos",
    image: "/lanches/suco-laranja.jpg",
   desc: "200 gramas" },

  { id: "batata-frita-cheddar-bacon",
    name: "Batata Frita + Cheddar + Bacon",
    price: 15.0,
    category: "Petiscos",
    image: "/lanches/agua.jpg",
    desc: "200 gramas" },

    { id: "batata-frita-cheddar-bacon-grande",
    name: "Batata Frita + Cheddar + Bacon",
    price: 20.0,
    category: "Petiscos",
    image: "/lanches/agua.jpg",
    desc: "360 gramas" },

    { id: "calabresa-acebolada",
    name: "Calabresa Acebolada",
    price: 15.0,
    category: "Petiscos",
    image: "/lanches/agua.jpg",
    desc: "" },

    { id: "calabresa-batata-frita",
    name: "Calabresa + Batata Frita",
    price: 20.0,
    category: "Petiscos",
    image: "/lanches/agua.jpg",
    desc: "" },
//

];

export default MENU;
