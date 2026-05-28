/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Settings, User, Plus, Minus, Trash, Edit, Search, Check, Info, Copy, CheckCircle, RefreshCw, X } from 'lucide-react';
import confetti from 'canvas-confetti';

// ==========================================
//  1. 預設精選茶飲菜單 (當後端未連線或作備用)
// ==========================================
interface MenuItem {
    id?: number;
    name: string;
    price: number;
    category: string;
    description: string;
}

const DEFAULT_MENU: MenuItem[] = [
    { id: 1, name: "蜜香熟成紅茶", price: 35, category: "經典原茶", description: "選用斯里蘭卡進口茶葉，烘焙蜜糖芬芳，口感醇厚而微甘。" },
    { id: 2, name: "茉莉凝仙綠茶", price: 35, category: "經典原茶", description: "新鮮茉莉與優質綠茶低溫十薰製，花香柔順，喉韻無窮。" },
    { id: 3, name: "黃金四季春青茶", price: 35, category: "經典原茶", description: "台灣在地南投翠綠四季春，冷泡熟客首選，帶有清新野百合香。" },
    { id: 4, name: "炭焙凍頂生烏龍", price: 40, category: "經典原茶", description: "中度烘焙炭香裊裊，茶色金黃，傳統生津解渴的最佳解。" },
    { id: 5, name: "焙茶醇厚拿鐵", price: 55, category: "香醇奶茶", description: "慢烤焙茶磨粉搭配厚奶精，辦公室萬年人敗最療癒香氣。" },
    { id: 6, name: "紅玉鮮奶茶", price: 60, category: "鮮奶茶類", description: "台茶 18 號紅玉紅茶香氣明亮，融合100%小農鮮乳，濃綿細膩。" },
    { id: 7, name: "黑糖厚烤珍珠鮮奶", price: 65, category: "鮮奶茶類", description: "現炒古法黑糖珍珠，淋入香濃整杯鮮奶，溫馨濃郁不可不點。" },
    { id: 8, name: "小芋圓甘蔗清茶", price: 65, category: "特調風味", description: "每日手作Q彈雙色小芋圓，配手上榨甘蔗原汁與甘涼四季春。" },
    { id: 9, name: "翡翠黃金檸檬綠", price: 50, category: "特調風味", description: "現榨新鮮屏東檸檬汁結合清幽綠茶，生津止渴、酸甜滿分。" },
    { id: 10, name: "芝芝粉莓櫻果粒", price: 75, category: "季節限定", description: "滿滿新鮮草莓現打冰沙，淋上一層粉嫩的海鹽芝士重乳奶蓋。" }
];

// ==========================================
//  2. 預設展示訂單數據
// ==========================================
interface OrderItem {
    orderId: string;
    timestamp: string;
    name: string;
    drink: string;
    sugar: string;
    ice: string;
    quantity: number;
    totalPrice: number;
}

const DEFAULT_ORDERS: OrderItem[] = [
    { orderId: "mock-order-1", timestamp: new Date(Date.now() - 3600000).toISOString(), name: "阿強 (專案經理)", drink: "炭焙凍頂生烏龍", sugar: "無糖", ice: "少冰", quantity: 1, totalPrice: 40 },
    { orderId: "mock-order-2", timestamp: new Date(Date.now() - 1800000).toISOString(), name: "依婷 (UI 設計師)", drink: "芝芝粉莓櫻果粒", sugar: "微糖", ice: "去冰", quantity: 1, totalPrice: 75 },
    { orderId: "mock-order-3", timestamp: new Date(Date.now() - 600000).toISOString(), name: "俊傑 (前端工程師)", drink: "黑糖厚烤珍珠鮮奶", sugar: "半糖", ice: "微冰", quantity: 2, totalPrice: 130 }
];

const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbzf4_7S8kC6x9D1Y-E_vF2eU3N_X_v87Y66/exec";

// ==========================================
//  3. OrderForm 元件
// ==========================================
interface OrderFormProps {
    menu: MenuItem[];
    editingOrder: OrderItem | null;
    onSubmitOrder: (order: Omit<OrderItem, 'orderId' | 'timestamp'> & { orderId?: string }) => void;
    onCancelEdit: () => void;
    isSending: boolean;
}

function OrderForm({ menu, editingOrder, onSubmitOrder, onCancelEdit, isSending }: OrderFormProps) {
    const [name, setName] = useState("");
    const [selectedDrink, setSelectedDrink] = useState<MenuItem | null>(null);
    const [sugar, setSugar] = useState("半糖");
    const [ice, setIce] = useState("少冰");
    const [quantity, setQuantity] = useState(1);
    const [activeCategory, setActiveCategory] = useState("全部");

    const SUGAR_OPTIONS = ["正常糖", "七分糖", "半糖", "微糖", "無糖"];
    const ICE_OPTIONS = ["正常冰", "少冰", "微冰", "去冰", "溫熱"];

    useEffect(() => {
        if (editingOrder) {
            setName(editingOrder.name);
            const drinkObj = menu.find(d => d.name === editingOrder.drink) || { name: editingOrder.drink, price: editingOrder.totalPrice / editingOrder.quantity, category: "經典原茶", description: "" };
            setSelectedDrink(drinkObj);
            setSugar(editingOrder.sugar);
            setIce(editingOrder.ice);
            setQuantity(editingOrder.quantity);
        } else {
            setName("");
            setSelectedDrink(menu[0] || null);
            setSugar("半糖");
            setIce("少冰");
            setQuantity(1);
        }
    }, [editingOrder, menu]);

    useEffect(() => {
        if (menu.length > 0 && !selectedDrink && !editingOrder) {
            setSelectedDrink(menu[0]);
        }
    }, [menu, selectedDrink, editingOrder]);

    const categories = useMemo(() => {
        const cats = ["全部"];
        menu.forEach(item => {
            if (item.category && !cats.includes(item.category)) {
                cats.push(item.category);
            }
        });
        return cats;
    }, [menu]);

    const filteredMenu = useMemo(() => {
        if (activeCategory === "全部") return menu;
        return menu.filter(item => item.category === activeCategory);
    }, [menu, activeCategory]);

    const calculatedTotal = useMemo(() => {
        if (!selectedDrink) return 0;
        return selectedDrink.price * quantity;
    }, [selectedDrink, quantity]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("請填寫您的【訂購人姓名】！");
            return;
        }
        if (!selectedDrink) {
            alert("請先選擇您想要的【飲料】！");
            return;
        }

        const orderData: Omit<OrderItem, 'orderId' | 'timestamp'> & { orderId?: string } = {
            name: name.trim(),
            drink: selectedDrink.name,
            sugar,
            ice,
            quantity,
            totalPrice: calculatedTotal
        };

        if (editingOrder && editingOrder.orderId) {
            orderData.orderId = editingOrder.orderId;
        }

        onSubmitOrder(orderData);
    };

    return (
        <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-2xl overflow-hidden transition-all duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    <div>
                        <h2 className="font-extrabold text-lg tracking-wide text-slate-800">
                            {editingOrder ? "修改點單內容" : "我要點餐"}
                        </h2>
                    </div>
                </div>
                {editingOrder && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="text-xs font-bold text-blue-600 hover:underline"
                    >
                        放棄修改 ✕
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* 1. 訂購人姓名 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5 font-sans">
                        <User className="w-4 h-4 text-slate-400" />
                        訂購人姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="例如：王大明 (行銷部)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/80 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-400 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                        required
                    />
                </div>

                {/* 2. 選擇飲料 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">🥤 選擇本日茗茶 / 果特調</span>
                        {selectedDrink && (
                            <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                                單價: NT$ {selectedDrink.price}
                            </span>
                        )}
                    </label>

                    {/* 分類橫載 */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2.5 -mx-1 px-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                                    activeCategory === cat
                                        ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/15'
                                        : 'bg-white border border-slate-200/60 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* 飲料小卡展示網格 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 mt-2 p-1 bg-white/40 rounded-xl border border-white/40 shadow-inner">
                        {filteredMenu.map(drink => {
                            const isSelected = selectedDrink && selectedDrink.name === drink.name;
                            return (
                                <div
                                    key={drink.name || drink.id}
                                    onClick={() => setSelectedDrink(drink)}
                                    className={`p-3 rounded-lg border cursor-pointer text-left transition-all duration-200 outline-none flex flex-col justify-between h-[82px] relative ${
                                        isSelected
                                            ? 'border-blue-500 bg-white shadow-md ring-1 ring-blue-500/20'
                                            : 'border-slate-200 bg-white/80 hover:border-blue-300 hover:bg-white'
                                    }`}
                                >
                                    {isSelected && (
                                        <span className="absolute top-2 right-2 text-blue-500 flex items-center justify-center bg-blue-50 rounded-full w-4.5 h-4.5 p-0.5">
                                            <Check className="w-3.5 h-3.5" />
                                        </span>
                                    )}
                                    <div>
                                        <h4 className={`text-xs font-extrabold truncate pr-5 ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                                            {drink.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-tight" title={drink.description}>
                                            {drink.description}
                                        </p>
                                    </div>
                                    <div className="text-xs font-black text-blue-600 mt-0.5">
                                        ${drink.price}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. 甜度 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">糖度（甜度完美比率）</label>
                    <div className="grid grid-cols-5 gap-1">
                        {SUGAR_OPTIONS.map(opt => {
                            const active = sugar === opt;
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setSugar(opt)}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                        active
                                            ? 'bg-blue-500 text-white shadow-sm font-bold'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                                    }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. 冰塊 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">冰度（消暑極限）</label>
                    <div className="grid grid-cols-5 gap-1">
                        {ICE_OPTIONS.map(opt => {
                            const active = ice === opt;
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setIce(opt)}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                        active
                                            ? 'bg-blue-500 text-white shadow-sm font-bold'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                                    }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. 數量 */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">訂購數量</label>
                    <div className="flex items-center gap-4 bg-white/80 p-1.5 rounded-xl ring-1 ring-slate-200">
                        <button
                            type="button"
                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl text-slate-500 hover:bg-slate-200 active:scale-90 transition-all"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-bold text-lg text-slate-800">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQuantity(prev => prev + 1)}
                            className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl text-slate-500 hover:bg-slate-200 active:scale-90 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* 總結 & 提交 */}
                <div className="p-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100 rounded-b-[2rem] -mx-6 -mb-6">
                    <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider ml-0.5">總金額</p>
                        <p className="text-2xl font-black text-blue-600 leading-none">NT$ {calculatedTotal}</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSending}
                        className={`px-8 py-3.5 text-white font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 text-sm justify-center ${
                            isSending
                                ? 'bg-blue-400 cursor-not-allowed opacity-80 shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200/50'
                        }`}
                    >
                        {isSending ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                連線同步中...
                            </>
                        ) : (
                            <>
                                {editingOrder ? "保存修改內容" : "送出訂單"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ==========================================
//  4. OrderList 元件
// ==========================================
interface OrderListProps {
    orders: OrderItem[];
    onEditOrder: (order: OrderItem) => void;
    onDeleteOrder: (orderId: string) => void;
    isDemoMode: boolean;
}

function OrderList({ orders, onEditOrder, onDeleteOrder }: OrderListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const dashboardData = useMemo(() => {
        const totalCups = orders.reduce((acc, o) => acc + o.quantity, 0);
        const totalCash = orders.reduce((acc, o) => acc + o.totalPrice, 0);
        
        const drinkCounts: Record<string, number> = {};
        orders.forEach(o => {
            drinkCounts[o.drink] = (drinkCounts[o.drink] || 0) + o.quantity;
        });
        
        let favoriteDrink = "無";
        let maxCount = 0;
        Object.entries(drinkCounts).forEach(([name, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteDrink = `${name} (${count}杯)`;
            }
        });

        return { totalCups, totalCash, favoriteDrink };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (!searchTerm.trim()) return orders;
        const s = searchTerm.toLowerCase();
        return orders.filter(o => 
            o.name.toLowerCase().includes(s) || 
            o.drink.toLowerCase().includes(s) ||
            o.sugar.toLowerCase().includes(s) ||
            o.ice.toLowerCase().includes(s)
        );
    }, [orders, searchTerm]);

    const formatTime = (isoString: string) => {
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch {
            return "";
        }
    };

    return (
        <div className="space-y-6">
            {/* 數據看板 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4.5 bg-white/40 backdrop-blur-xl rounded-[1.5rem] border border-white/50 p-4 shadow-xl">
                <div className="text-center">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">今日合計</span>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-lg sm:text-2xl font-black text-blue-600">
                            {dashboardData.totalCups}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">杯</span>
                    </div>
                </div>

                <div className="border-x border-slate-200/60 text-center">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">總預算金額</span>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-[10px] text-blue-500 font-bold">NT$</span>
                        <span className="text-lg sm:text-2xl font-black text-blue-600">
                            {dashboardData.totalCash}
                        </span>
                    </div>
                </div>

                <div className="text-center overflow-hidden">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">超人氣榜首</span>
                    <div className="text-slate-700 text-xs sm:text-xs font-black truncate mt-1.5 px-1 font-sans" title={dashboardData.favoriteDrink}>
                        {dashboardData.favoriteDrink}
                    </div>
                </div>
            </div>

            {/* 訂單表單 */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl overflow-hidden flex flex-col min-h-[480px]">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                            📋 今日訂單明細
                            <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                                共 {orders.length} 筆
                            </span>
                        </h2>
                    </div>
                    
                    {/* 搜尋 */}
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="搜尋訂購人/飲料..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-48 pl-9 pr-3.5 py-2 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs text-slate-700"
                        />
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-center">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 px-4 max-w-sm mx-auto">
                            <div className="w-24 h-24 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100/10">
                                <Info className="w-12 h-12 text-slate-400" />
                            </div>
                            <h3 className="text-slate-800 font-extrabold text-base mb-2">今天尚未任何人發起訂單</h3>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
                                辦公室今日氣溫似乎特別乾燥... 高尚的勇者，快在左側填單加入今日第一杯，帶起大家手搖風潮吧！🥤
                            </p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                            無符合「{searchTerm}」之飲料或名字。請重新編輯關鍵字。
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {filteredOrders.map((item, index) => (
                                <div
                                    key={item.orderId || index}
                                    className="p-4 rounded-2xl border border-white/60 bg-white/80 hover:bg-white hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-3 group"
                                >
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-slate-800 text-sm truncate max-w-[120px]" title={item.name}>
                                                {item.name}
                                            </span>
                                            {item.timestamp && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {formatTime(item.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="font-extrabold text-slate-700 text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                                {item.drink}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-50 text-pink-600 border border-pink-100">
                                                {item.sugar}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-600 border border-cyan-100">
                                                {item.ice}
                                            </span>
                                            {item.quantity > 1 && (
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                                    ✕ {item.quantity} 杯
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm font-black text-blue-600">
                                                NT$ {item.totalPrice}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEditOrder(item)}
                                                title="編輯訂單"
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg active:scale-90 transition-all cursor-pointer"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if(confirm(`確定要刪除「${item.name}」的點單嗎？`)) {
                                                        onDeleteOrder(item.orderId);
                                                    }
                                                }}
                                                title="刪除"
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg active:scale-90 transition-all cursor-pointer"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==========================================
//  5. SettingsModal 元件
// ==========================================
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    gasUrl: string;
    onSaveUrl: (url: string) => void;
}

function SettingsModal({ isOpen, onClose, gasUrl, onSaveUrl }: SettingsModalProps) {
    const [inputUrl, setInputUrl] = useState(gasUrl);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setInputUrl(gasUrl);
    }, [gasUrl]);

    const handleSave = () => {
        onSaveUrl(inputUrl);
        onClose();
    };

    const handleReset = () => {
        setInputUrl(DEFAULT_GAS_URL);
    };

    const handleCopyCode = () => {
        const gasCode = `/**
 * Google Apps Script 辦公室飲料訂購 API 範本
 */

function doGet(e) {
  var sheet = getTodaySheet();
  var menu = getPresetMenu();
  var orders = getSheetOrders(sheet);
  
  var response = {
    menu: menu,
    orders: orders
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action;
    var data = payload.data;
    
    var sheet = getTodaySheet();
    var responseData = { success: true };
    
    if (action === "create") {
      var orderId = "ord-" + Math.floor(Math.random() * 1000000) + "-" + new Date().getTime();
      sheet.appendRow([
        orderId,
        new Date().toISOString(),
        data.name,
        data.drink,
        data.sugar,
        data.ice,
        data.quantity,
        data.totalPrice
      ]);
      responseData.orderId = orderId;
    } 
    else if (action === "update") {
      var orderId = data.orderId;
      var rows = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == orderId) {
          sheet.getRange(i + 1, 3, 1, 6).setValues([[
            data.name,
            data.drink,
            data.sugar,
            data.ice,
            data.quantity,
            data.totalPrice
          ]]);
          found = true;
          break;
        }
      }
      if (!found) throw new Error("找不到對應的訂單ID: " + orderId);
    } 
    else if (action === "delete") {
      var orderId = data.orderId;
      var rows = sheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == orderId) {
          sheet.deleteRow(i + 1);
          found = true;
          break;
        }
      }
      if (!found) throw new Error("找不到對應的訂單ID: " + orderId);
    }
    
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getTodaySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var today = new Date();
  var sheetName = Utilities.formatDate(today, "GMT+8", "yyyy-MM-dd");
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["訂單ID", "時間戳記", "訂購人", "飲料名稱", "糖度", "冰度", "數量", "總金額"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getSheetOrders(sheet) {
  var values = sheet.getDataRange().getValues();
  var orders = [];
  if (values.length <= 1) return orders;
  
  for (var i = 1; i < values.length; i++) {
    orders.push({
      orderId: values[i][0],
      timestamp: values[i][1],
      name: values[i][2],
      drink: values[i][3],
      sugar: values[i][4],
      ice: values[i][5],
      quantity: Number(values[i][6]),
      totalPrice: Number(values[i][7])
    });
  }
  return orders;
}

function getPresetMenu() {
  return [
    { name: "蜜香熟成紅茶", price: 35, category: "經典原茶", description: "選用斯里蘭卡進口茶葉，烘焙蜜糖芬芳，口感醇厚而微甘。" },
    { name: "茉莉凝仙綠茶", price: 35, category: "經典原茶", description: "新鮮茉莉與優質綠茶低溫十薰製，花香柔順，喉韻無窮。" },
    { name: "黃金四季春青茶", price: 35, category: "經典原茶", description: "台灣在地南投翠綠四季春，冷泡熟客首選，帶有清新野百合香。" },
    { name: "炭焙凍頂生烏龍", price: 40, category: "經典原茶", description: "中度烘焙炭香裊裊，茶色金黃，傳統生津解渴的最佳解。" },
    { name: "焙茶醇厚拿鐵", price: 55, category: "香醇奶茶", description: "慢烤焙茶磨粉搭配厚奶精，辦公室萬年人敗最療癒香氣。" },
    { name: "紅玉鮮奶茶", price: 60, category: "鮮奶茶類", description: "台茶 18 號紅玉紅茶香氣明亮，融合100%小農鮮乳，濃綿細膩。" },
    { name: "黑糖厚烤珍珠鮮奶", price: 65, category: "鮮奶茶類", description: "現炒古法黑糖珍珠，淋入香濃整杯鮮奶，溫馨濃郁不可不點。" },
    { name: "小芋圓甘蔗清茶", price: 65, category: "特調風味", description: "每日手作Q彈雙色小芋圓，配手上榨甘蔗原汁與甘涼四季春。" },
    { name: "翡翠黃金檸檬綠", price: 50, category: "特調風味", description: "現榨新鮮屏東檸檬汁結合清幽綠茶，生津止渴、酸甜滿分。" },
    { name: "芝芝粉莓櫻果粒", price: 75, category: "季節限定", description: "滿滿新鮮草莓現打冰沙，淋上一層粉嫩的海鹽芝士重乳奶蓋。" }
  ];
}`;
        navigator.clipboard.writeText(gasCode)
          .then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
          });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/50 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto animate-slide-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/45">
                    <div>
                        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                            ⚙️ 系統設定面板
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">自訂您的 Google 試算表 GAS API 連線路徑</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 active:scale-90 transition-all text-xs font-bold cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            Google Apps Script 網址 (GAS URL)
                        </label>
                        <input
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="https://script.google.com/macros/s/.../exec"
                            className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-xs text-slate-700 font-mono"
                        />
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>* 點擊右上角小齒輪可隨時配置</span>
                            <button
                                onClick={handleReset}
                                type="button"
                                className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                            >
                                還原為預設示範網址
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/50 flex gap-3 text-slate-700 text-xs">
                        <span className="text-base">ℹ️</span>
                        <div className="space-y-1">
                            <h4 className="font-bold text-slate-800">貼心功能</h4>
                            <p className="leading-relaxed text-slate-400 font-semibold">
                                設定的 GAS 網址會儲存於您的本機瀏覽器 (localStorage) 中！下次開啟網頁，系統仍可自動記住並連接。當網址不可用或為空時，系統將轉為模擬模式。
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100 text-left">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-slate-800">
                                💡 如何在 Google 試算表架設 API？
                            </h4>
                            <button
                                onClick={handleCopyCode}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-400 active:scale-95 text-[11px] font-bold text-blue-700 rounded-lg transition-all cursor-pointer"
                            >
                                {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? "已複製代碼！" : "複製 Apps Script 原始碼"}
                            </button>
                        </div>

                        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2 leading-relaxed pl-1 font-semibold">
                            <li>建立一個新的 Google 試算表。</li>
                            <li>點擊「擴充功能」 {"➔"} 「Apps Script」。</li>
                            <li>將專案預設程式碼全部刪除，並貼上複製的原始碼。</li>
                            <li>點擊「部署」 {"➔"} 「新部署」 {"➔"} 選擇「網路應用程式」。</li>
                            <li>選取存取權為「任何人 (Anyone)」，點擊「部署」、授權，然後複製「網路應用程式 URL」。</li>
                        </ol>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/45 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 text-xs font-bold transition-all cursor-pointer"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl active:scale-95 text-xs font-bold transition-all cursor-pointer"
                    >
                        保存與套用
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
//  5.5 慶祝特效元件 (Confetti)
// ==========================================
const triggerConfetti = (scalarValue = 1) => {
    try {
        confetti({
            particleCount: Math.floor(80 * scalarValue),
            spread: 60,
            origin: { y: 0.75 },
            colors: ['#D9AD16', '#4A3728', '#FAF6ED', '#EAC826', '#FF6B6B']
        });
    } catch (e) {
        console.log("Confetti is not supported or not loaded correctly", e);
    }
};

// ==========================================
//  6. App 主要進入點
// ==========================================
export default function App() {
    const [gasUrl, setGasUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("office_drink_gas_url") || "";
        }
        return "";
    });

    const [menu, setMenu] = useState<MenuItem[]>(DEFAULT_MENU);
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    
    const LOCAL_ORDERS_KEY = "office_drink_local_orders";

    const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const fetchTodayData = async (currentUrl = gasUrl) => {
        setLoading(true);
        setError(null);

        if (!currentUrl) {
            setIsDemoMode(true);
            loadLocalMockData();
            setLoading(false);
            return;
        }

        try {
            const requestUrl = `${currentUrl}?t=${new Date().getTime()}`;
            const response = await fetch(requestUrl, {
                method: "GET",
                mode: "cors"
            });

            if (!response.ok) {
                throw new Error(`狀態碼: ${response.status}`);
            }

            const resData = await response.json();
            
            if (resData.menu && Array.isArray(resData.menu)) {
                setMenu(resData.menu);
            } else {
                setMenu(DEFAULT_MENU);
            }

            if (resData.orders && Array.isArray(resData.orders)) {
                setOrders(resData.orders);
            } else {
                setOrders([]);
            }
            
            setIsDemoMode(false);

        } catch (err: any) {
            console.error(err);
            setError("API 連線異常，已轉為 local 模擬操作：");
            setIsDemoMode(true);
            loadLocalMockData();
        } finally {
            setLoading(false);
        }
    };

    const loadLocalMockData = () => {
        const storedOrders = localStorage.getItem(LOCAL_ORDERS_KEY);
        if (storedOrders) {
            try {
                setOrders(JSON.parse(storedOrders));
            } catch {
                setOrders(DEFAULT_ORDERS);
            }
        } else {
            setOrders(DEFAULT_ORDERS);
            localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(DEFAULT_ORDERS));
        }
        setMenu(DEFAULT_MENU);
    };

    useEffect(() => {
        fetchTodayData();
    }, []);

    const handleOrderSubmit = async (orderData: Omit<OrderItem, 'orderId' | 'timestamp'> & { orderId?: string }) => {
        setIsSending(true);
        
        if (isDemoMode) {
            setTimeout(() => {
                let updatedOrders = [...orders];

                if (orderData.orderId) {
                    updatedOrders = updatedOrders.map(o => 
                        o.orderId === orderData.orderId 
                            ? { ...o, ...orderData, timestamp: new Date().toISOString() } as OrderItem
                            : o
                    );
                    triggerConfetti(0.4);
                } else {
                    const newOrder: OrderItem = {
                        ...orderData,
                        orderId: "local-" + Math.floor(Math.random() * 1000000) + "-" + Date.now(),
                        timestamp: new Date().toISOString()
                    };
                    updatedOrders.push(newOrder);
                    triggerConfetti(0.85);
                }

                setOrders(updatedOrders);
                localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updatedOrders));
                setEditingOrder(null);
                setIsSending(false);
            }, 800);
            return;
        }

        try {
            const isUpdate = !!orderData.orderId;
            const payload = {
                action: isUpdate ? "update" : "create",
                data: orderData
            };

            await fetch(gasUrl, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (isUpdate) {
                setOrders(prev => prev.map(o => o.orderId === orderData.orderId ? { ...o, ...orderData } as OrderItem : o));
                triggerConfetti(0.4);
            } else {
                const tempOrderId = "gas-temp-" + Date.now();
                setOrders(prev => [...prev, { ...orderData, orderId: tempOrderId, timestamp: new Date().toISOString() } as OrderItem]);
                triggerConfetti(0.85);
            }

            setEditingOrder(null);
            
            setTimeout(() => {
                fetchTodayData(gasUrl);
            }, 1200);

        } catch (err: any) {
            alert("發送出錯：" + err.toString());
        } finally {
            setIsSending(false);
        }
    };

    const handleOrderDelete = async (orderId: string) => {
        if (isDemoMode) {
            const updatedOrders = orders.filter(o => o.orderId !== orderId);
            setOrders(updatedOrders);
            localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updatedOrders));
            if (editingOrder && editingOrder.orderId === orderId) {
                setEditingOrder(null);
            }
            return;
        }

        try {
            setOrders(prev => prev.filter(o => o.orderId !== orderId));
            if (editingOrder && editingOrder.orderId === orderId) {
                setEditingOrder(null);
            }

            const payload = {
                action: "delete",
                data: { orderId }
            };

            await fetch(gasUrl, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            setTimeout(() => {
                fetchTodayData(gasUrl);
            }, 1200);

        } catch (err: any) {
            alert("刪除出錯：" + err.toString());
        }
    };

    const handleSaveGasUrl = (newUrl: string) => {
        localStorage.setItem("office_drink_gas_url", newUrl);
        setGasUrl(newUrl);
        fetchTodayData(newUrl);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col relative overflow-hidden pb-16">
            {/* Ambient Blurred Background Blobs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>

            {/* Header */}
            <header className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between px-8 py-6 bg-white/40 backdrop-blur-lg border-b border-white/25 shadow-sm rounded-3xl m-4 sm:m-8 gap-6">
                <div className="flex items-center gap-4.5">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center flex-wrap gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                辦公室飲料訂購系統
                            </h1>
                            <div className="inline-flex items-center">
                                {isDemoMode ? (
                                    <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        模擬展示
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 text-[10px] font-bold bg-green-50 text-green-700 rounded-full border border-green-200 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                                        GAS 雲端連線中
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            今日點單統計：共 <span className="text-blue-600 font-bold">{orders.reduce((acc, o) => acc + o.quantity, 0)}</span> 杯 / 總額 <span className="text-blue-600 font-bold">NT$ {orders.reduce((acc, o) => acc + o.totalPrice, 0)}</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 relative z-10">
                    <button
                        onClick={() => fetchTodayData()}
                        disabled={loading}
                        className="px-4 py-2 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-800 text-xs rounded-xl border border-slate-200/80 shadow-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? "更新中..." : "重新載入"}
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center transition-all border border-blue-400/30 cursor-pointer"
                        title="設定 GAS 網址"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* 主內容 */}
            <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative z-10">
                {error && (
                    <div className="col-span-12 p-3 bg-red-50/80 backdrop-blur border border-red-100 rounded-xl text-xs text-red-600 font-semibold flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span>⚠️</span>
                            <span>{error} 測試專案若有網路阻隔 CORS，可直接於模擬模式暢快體驗！請點選右上角齒輪設定 GAS。</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <section className="lg:col-span-5 h-fit lg:sticky lg:top-8">
                    <OrderForm
                        menu={menu}
                        editingOrder={editingOrder}
                        onSubmitOrder={handleOrderSubmit}
                        onCancelEdit={() => setEditingOrder(null)}
                        isSending={isSending}
                    />
                </section>

                <section className="lg:col-span-7 space-y-6">
                    <OrderList
                        orders={orders}
                        onEditOrder={(order) => {
                            setEditingOrder(order);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onDeleteOrder={handleOrderDelete}
                        isDemoMode={isDemoMode}
                    />
                </section>
            </main>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                gasUrl={gasUrl}
                onSaveUrl={handleSaveGasUrl}
            />

            <footer className="mt-16 text-center text-xs text-slate-400 font-medium col-span-12 relative z-10">
                🥤 辦公室手搖團發起系統 ． 每天都要對自己的喉嚨溫柔一點 ． 🍵
            </footer>
        </div>
    );
}
