# iiko Integration - Reference from AlSaraya Project

## ✅ Successful Implementation (AlSaraya)

### Key Findings

**Their Setup:**
- Backend Express server handling API calls
- Uses `/api/2/menu` for external menus
- Uses `/api/1/nomenclature` for internal POS products
- Proper error handling with multiple fallbacks

### Correct API Endpoints & Parameters

#### 1. **List External Menus**
```javascript
POST /api/2/menu
{
  "organizationIds": ["32d5187a-c03f-4b28-8c7f-901e91dc639c"],
  "externalMenuId": null  // null to list all menus
}
```

Response:
```javascript
{
  "externalMenus": [
    {
      "id": "9321",
      "name": "Main Menu",
      "itemGroups": [
        {
          "id": "cat-123",
          "name": "Meat",
          "items": [
            {
              "itemId": "prod-456",
              "name": "Beef Steak",
              "itemSizes": [
                {
                  "sizeId": "size-1",
                  "prices": [
                    { "price": 85.00 }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### 2. **Fetch Menu by ID (with products)**
```javascript
POST /api/2/menu/by_id
{
  "organizationIds": ["32d5187a-c03f-4b28-8c7f-901e91dc639c"],
  "externalMenuId": "9321"
}
```

Response Structure:
```javascript
{
  "groups": [
    {
      "id": "cat-123",
      "name": "Meat"
    }
  ],
  "products": [
    {
      "id": "prod-456",
      "name": "Beef Steak",
      "parentGroup": "cat-123",  // Links product to category
      "sizePrices": [
        {
          "price": 85.00
        }
      ]
    }
  ]
}
```

#### 3. **Internal POS Nomenclature (Fallback)**
```javascript
POST /api/1/nomenclature
{
  "organizationId": "32d5187a-c03f-4b28-8c7f-901e91dc639c"
}
```

Response:
```javascript
{
  "groups": [
    {
      "id": "group-1",
      "name": "Meat"
    }
  ],
  "products": [
    {
      "id": "prod-1",
      "name": "Beef Steak",
      "parentGroup": "group-1",  // Links to groups
      "sizePrices": [
        {
          "price": {
            "currentPrice": 85.00
          }
        }
      ]
    }
  ]
}
```

## 🔑 Key Differences from Your Current Implementation

| Issue | Your Current | Correct |
|-------|-------------|---------|
| **organizationId format** | Single string | `organizationIds` array |
| **Response fields** | Looks for `itemCategories` | Look for `groups` (nomenclature) or `itemGroups` (external menu) |
| **Product structure** | Various formats | `parentGroup` links product to category |
| **Menu ID parameter** | Passed but not used | Must pass `externalMenuId` to filter |
| **Price field** | `itemSizes[].prices[]` | `sizePrices[].price.currentPrice` or `itemSizes[].prices[].price` |

## 📋 Recommended Flow

### User Workflow:
1. **List all external menus** → `/api/2/menu` (with externalMenuId: null)
2. **Select a menu** → Store menu ID
3. **Fetch menu + products** → `/api/2/menu/by_id` with selected menuId
4. **Extract structure:**
   - Loop through `groups` array (= categories)
   - Within each group, find products where `product.parentGroup === group.id`
   - Display products under their categories

### Error Handling:
- If `/api/2/menu/by_id` fails → Try `/api/2/menu` with same externalMenuId
- If `/api/2/menu` fails → Fall back to `/api/1/nomenclature`
- If nomenclature fails → Return clear error to user

## 🛠️ Tests They Run

They have helper scripts:
- `fetch-iiko-products.js` - Fetch specific menu (you need this logic)
- `explore-all-menus.js` - List all available menus
- `fetch-internal-nomenclature.js` - Get POS products directly

You can adapt these to test your edge function.
