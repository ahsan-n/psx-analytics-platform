# PSX Data Portal (DPS) — Requests Catalog and Expected Responses

Sources:
- https://dps.psx.com.pk/
- https://www.psx.com.pk/

Note: Production use requires a PSX market data license (marketdatarequest@psx.com.pk).

How to capture: Use DevTools → Network on DPS pages (XHR/Fetch) and log METHOD, URL, params, headers, and a redacted sample JSON.

---

## Indices Snapshot
- Section: Market → Indices; Today’s Summary
- METHOD: GET | URL: [TBD] | Query: [TBD] | Headers/Auth: [TBD]
- Expected normalized response:
```json
{
  "asOf": "2025-08-13T15:50:00Z",
  "indices": [
    {"code":"KSE100","name":"KSE100","value":146529.30,"change":-476.02,"changePct":-0.32,"high":147892.25,"low":146417.80,"volume":298882392}
  ]
}
```

## Sector Summary / Breakdown
- Section: Market → Sector Summary
- METHOD: GET | URL: [TBD] | Query: [TBD]
- Expected normalized response:
```json
{
  "sectors":[{"name":"Banking","marketCap":2850000,"percentage":28.5,"companiesCount":15,"avgPE":6.8,"performance1M":2.4}],
  "totalMarketCap":10000000,
  "lastUpdated":"2025-08-13T15:50:00Z"
}
```

## Today’s Summary (Boards Totals)
- Section: Market → Today’s Summary
- METHOD: GET | URL: [TBD] | Query: [TBD]
- Expected normalized response:
```json
{
  "asOf":"2025-08-13T15:50:00Z",
  "boards":[{"board":"Main Board","trades":365001,"volume":647094379,"value":40896285386.43}]
}
```

## Companies Directory / Listing Status
- Section: Companies → Listing Status
- METHOD: GET | URL: [TBD] | Query: sector,status,page,limit
- Expected normalized response:
```json
{
  "companies":[{"symbol":"HBL","name":"Habib Bank Limited","sector":"Banking","marketCap":485000,"price":142.50,"change":2.1,"pe":6.2}],
  "total":600,"page":1,"limit":20
}
```

## Company Analytics (Profile, Financials, Performance)
- Sections: Reports → Financial Reports; Announcements; Market → Historical Data
- METHOD: GET (multiple) | URLs: [TBD] | Query: symbol, date ranges
- Expected normalized response:
```json
{
  "company":{"symbol":"HBL","name":"Habib Bank Limited","sector":"Banking","industry":"Commercial Banks","marketCap":485000,"sharesOutstanding":3400000000,"description":"...","website":"https://www.hbl.com"},
  "financials":{"revenue":285000,"netIncome":42500,"totalAssets":3850000,"totalEquity":285000,"cash":185000,"debt":2850000},
  "ratios":{"pe":6.2,"pb":1.7,"roe":14.9,"roa":1.1,"debtToEquity":10.0,"currentRatio":1.2,"grossMargin":65.8,"netMargin":14.9},
  "performance":{"price":142.50,"change1D":2.1,"change1W":3.8,"change1M":8.5,"change3M":15.2,"change1Y":28.7,"high52W":158.75,"low52W":98.25}
}
```

## Historical Prices (OHLCV)
- Section: Market → Historical Data
- METHOD: GET | URL: [TBD] | Query: symbol,dateFrom,dateTo,interval
- Expected normalized response:
```json
{"symbol":"HBL","series":[{"date":"2025-07-01","open":140.0,"high":145.0,"low":138.5,"close":142.5,"volume":4500000}]}
```

## Announcements Feed
- Section: Announcements → Company Announcements
- METHOD: GET | URL: [TBD] | Query: symbol,date range,type
- Expected normalized response:
```json
{"symbol":"HBL","announcements":[{"id":"abc123","date":"2025-08-01","title":"Board Meeting","category":"Corporate Action","url":"https://..."}]}
```

## Market Performers (Gainers/Losers/Volume Leaders)
- Section: Market → Market Performers
- METHOD: GET | URL: [TBD] | Query: board,session
- Expected normalized response:
```json
{"gainers":[{"symbol":"TRG","price":125.75,"changePct":5.2}],"losers":[{"symbol":"DGKC","price":89.25,"changePct":-4.1}],"volumeLeaders":[{"symbol":"UNITY","volume":18200000}]}
```

---

## Capture Checklist
- [ ] Record METHOD/URL/Query/Headers
- [ ] Save sample response (JSON)
- [ ] Note auth/session/CSRF requirements
- [ ] Add caching notes (TTL, keys)
- [ ] Map fields to our OpenAPI models

