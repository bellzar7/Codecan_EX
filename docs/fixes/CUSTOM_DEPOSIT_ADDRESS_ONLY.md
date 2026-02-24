# Custom Deposit Address Only - Implementation Summary

## Задача
Повністю видалити system deposit addresses. Користувачі мають бачити ТІЛЬКИ custom addresses з профілю. Якщо немає custom address → показати повідомлення замість адреси.

## Зміни

### 1. ✅ [`src/stores/user/wallet/deposit.ts`](src/stores/user/wallet/deposit.ts)

**Видалено API call повністю з функції `fetchDepositAddress`:**

#### Було:
- Перевірка custom addresses
- Якщо не знайдено → API call до `/api/finance/currency/${walletType}/${currency}/${network}`
- Отримання system deposit address з API

#### Стало:
- Перевірка custom addresses (Priority 1: exact match, Priority 2: currency match)
- Якщо знайдено → `set({ depositAddress: customAddress })`
- Якщо НЕ знайдено → `set({ depositAddress: null })`
- **❌ НЕМАЄ API CALL**

```typescript
// ❌ NO API CALL - if no custom address, set to null
console.log("[DepositStore] ❌ No custom address configured for this currency/network");
console.log("[DepositStore] Setting depositAddress to null");
set((state) => {
  state.depositAddress = null;
});
```

### 2. ✅ [`src/components/pages/user/wallet/deposit/DepositAddress/DepositAddress.tsx`](src/components/pages/user/wallet/deposit/DepositAddress/DepositAddress.tsx)

**Додано перевірку та UI для випадку без custom address:**

#### Додано:
- Import `useRouter` from "next/router"
- Перевірка `if (!userDepositAddress)` перед основним UI
- Новий UI блок з повідомленням

#### UI для випадку без адреси:
```tsx
if (!userDepositAddress) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon icon="mdi:alert-circle-outline" className="mb-4 h-16 w-16 text-warning-500" />
      <h3 className="mb-2 text-2xl font-semibold">
        {t("No Deposit Address Configured")}
      </h3>
      <p className="mb-4 text-muted-500">
        {t("Your account does not have a deposit address set up for")} {selectedCurrency}
        {selectedDepositMethod && <> on {selectedDepositMethod} network</>}
      </p>
      <p className="mb-6 text-muted-500">
        {t("Please contact support to configure your deposit address.")}
      </p>
      <div className="flex gap-4">
        <Button color="default" onClick={() => { setSelectedDepositMethod(null, null); setStep(3); }}>
          <Icon icon="mdi:chevron-left" /> {t("Go Back")}
        </Button>
        <Button color="primary" onClick={() => router.push("/user/support")}>
          <Icon icon="mdi:lifebuoy" /> {t("Contact Support")}
        </Button>
      </div>
    </div>
  );
}
```

## Поведінка системи

### ✅ Якщо є custom address:
1. User вибирає currency (наприклад USDT)
2. User вибирає network (наприклад TRC20)
3. Store шукає custom address з `profile.customAddressWalletsPairFields`
4. **Знайдено** → показує custom address (TK5F8mcAHAcgetuhr25ypfQUEqDEUZMEtP)
5. User може скопіювати адресу, отримати QR код, ввести transaction hash

### ❌ Якщо НЕМАЄ custom address:
1. User вибирає currency (наприклад BTC)
2. User вибирає network (наприклад Bitcoin)
3. Store шукає custom address з `profile.customAddressWalletsPairFields`
4. **НЕ знайдено** → `depositAddress = null`
5. Component показує повідомлення:
   - **Icon:** Warning icon (alert-circle-outline)
   - **Title:** "No Deposit Address Configured"
   - **Message:** "Your account does not have a deposit address set up for BTC on Bitcoin network"
   - **Action:** "Please contact support to configure your deposit address"
   - **Buttons:**
     - "Go Back" → повертає на step 3 (вибір network)
     - "Contact Support" → redirect на `/user/support`

## Логіка пошуку custom address

### Priority 1: Exact match (currency + network)
```typescript
const exactMatch = customAddresses.find(
  (addr) => addr.currency === selectedCurrency && 
            addr.network === selectedDepositMethod
);
```

### Priority 2: Currency-only match
```typescript
const currencyMatch = customAddresses.find(
  (addr) => addr.currency === selectedCurrency
);
```

### Priority 3: No match
```typescript
set({ depositAddress: null });
```

## Структура custom address

Custom addresses зберігаються в `profile.customAddressWalletsPairFields`:

```typescript
[
  {
    address: "TK5F8mcAHAcgetuhr25ypfQUEqDEUZMEtP",
    currency: "USDT",
    network: "TRC20"
  },
  {
    address: "0x1234567890abcdef...",
    currency: "USDT",
    network: "ERC20"
  }
]
```

## Переваги рішення

1. **✅ Безпека:** System addresses більше не використовуються
2. **✅ Контроль:** Тільки admin може додати custom address через profile
3. **✅ UX:** Чіткі повідомлення для user коли немає address
4. **✅ Підтримка:** Легко направити user до support
5. **✅ Логи:** Детальні console.log для debugging

## Тестування

### Test Case 1: User з custom address
- [ ] Login як user з custom address для USDT/TRC20
- [ ] Перейти до Deposit
- [ ] Вибрати USDT
- [ ] Вибрати TRC20
- [ ] **Очікується:** Показує custom address TK5F8mcAHAcgetuhr25ypfQUEqDEUZMEtP
- [ ] **Очікується:** QR код генерується
- [ ] **Очікується:** Можна скопіювати адресу

### Test Case 2: User БЕЗ custom address
- [ ] Login як user БЕЗ custom address
- [ ] Перейти до Deposit
- [ ] Вибрати будь-яку currency (наприклад BTC)
- [ ] Вибрати будь-який network (наприклад Bitcoin)
- [ ] **Очікується:** Показує повідомлення "No Deposit Address Configured"
- [ ] **Очікується:** Показує currency/network в повідомленні
- [ ] **Очікується:** Кнопка "Contact Support" працює
- [ ] **Очікується:** Кнопка "Go Back" повертає на step 3

### Test Case 3: User з partial custom address
- [ ] Login як user з custom address тільки для USDT
- [ ] Перейти до Deposit
- [ ] Вибрати BTC (немає custom)
- [ ] **Очікується:** Показує повідомлення "No Deposit Address Configured"
- [ ] Вибрати USDT (є custom)
- [ ] **Очікується:** Показує custom address для USDT

### Test Case 4: Console logs
- [ ] Відкрити DevTools Console
- [ ] Пройти flow deposit
- [ ] **Очікується:** Логи показують:
  - "Checking for custom addresses..."
  - "Custom addresses found" або "No custom addresses configured"
  - "Found exact match" або "Found currency match" або "No custom address configured"
  - "Setting depositAddress to null" (якщо немає custom)

## API Endpoints НЕ використовуються

### ❌ Видалено:
- `GET /api/finance/currency/${walletType}/${currency}/${network}` - більше НЕ викликається

### ✅ Залишилися:
- `GET /api/finance/currency?action=deposit&walletType=${walletType}` - список currencies
- `GET /api/finance/currency/${walletType}/${currency}?action=deposit` - deposit methods
- `POST /api/finance/deposit/spot` - відправка transaction hash (це залишається)

## Подальші покращення (опціонально)

### 1. Filter deposit methods по custom addresses
Можна додати фільтрацію networks щоб показувати тільки ті для яких є custom addresses:

```typescript
// У fetchDepositMethods
const availableNetworks = methodsData.filter(method => {
  const customAddresses = profile?.customAddressWalletsPairFields || [];
  return customAddresses.some(
    addr => addr.currency === selectedCurrency && 
            addr.network === method.chain
  );
});

if (availableNetworks.length === 0) {
  // Show message: "No deposit methods available"
}
```

### 2. Settings toggle
Додати в admin settings можливість увімкнути/вимкнути system addresses:

```typescript
USE_CUSTOM_ADDRESSES_ONLY: true/false
```

### 3. Admin notification
Коли user натискає "Contact Support", можна відправити notification admin що user потребує custom address для певної currency/network.

## Файли змінені

1. ✅ [`src/stores/user/wallet/deposit.ts`](src/stores/user/wallet/deposit.ts) - видалено API call
2. ✅ [`src/components/pages/user/wallet/deposit/DepositAddress/DepositAddress.tsx`](src/components/pages/user/wallet/deposit/DepositAddress/DepositAddress.tsx) - додано UI для no address

## Примітки

- TypeScript та Biome errors в результатах - це існуючі проблеми в проекті (any types, missing modules), не пов'язані з цими змінами
- Custom addresses налаштовуються через admin panel в profile user
- System deposit addresses більше НЕ генеруються і НЕ використовуються
