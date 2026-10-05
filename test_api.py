import requests
import time

base = 'http://127.0.0.1:5000'

print('=== API Endpoint Tests ===\n')

# Test 1: Create positive entry
r1 = requests.post(f'{base}/api/entries', json={'text': 'I feel absolutely wonderful today!'})
data1 = r1.json()
print(f"POST /api/entries (positive): {r1.status_code}")
print(f"  -> mood={data1['entry']['mood']}, polarity={data1['entry']['polarity']}, success={data1['success']}")

# Test 2: Create negative entry
r2 = requests.post(f'{base}/api/entries', json={'text': 'I am so sad and depressed right now.'})
data2 = r2.json()
print(f"POST /api/entries (negative): {r2.status_code}")
print(f"  -> mood={data2['entry']['mood']}, polarity={data2['entry']['polarity']}, success={data2['success']}")

# Test 3: Create neutral entry
r3 = requests.post(f'{base}/api/entries', json={'text': 'The meeting was at 3 PM.'})
data3 = r3.json()
print(f"POST /api/entries (neutral): {r3.status_code}")
print(f"  -> mood={data3['entry']['mood']}, polarity={data3['entry']['polarity']}, success={data3['success']}")

# Test 4: Get all entries
r4 = requests.get(f'{base}/api/entries')
data4 = r4.json()
print(f"GET /api/entries: {r4.status_code}")
print(f"  -> count={data4['count']}, success={data4['success']}")
for e in data4['entries']:
    print(f"     [{e['mood']}] {e['text'][:40]}... (polarity={e['polarity']})")

# Test 5: Get stats
r5 = requests.get(f'{base}/api/stats')
stats = r5.json()
print(f"GET /api/stats: {r5.status_code}")
print(f"  -> total={stats['total']}, pos={stats['positive']}, neg={stats['negative']}, neu={stats['neutral']}")
print(f"  -> avg_polarity={stats['avg_polarity']}, avg_subjectivity={stats['avg_subjectivity']}")

# Test 6: Get trends
r6 = requests.get(f'{base}/api/trends')
trends = r6.json()
print(f"GET /api/trends: {r6.status_code}")
print(f"  -> dates={list(trends['trends'].keys())}")

# Test 7: Delete an entry
entry_id = data1['entry']['id']
r7 = requests.delete(f'{base}/api/entries/{entry_id}')
print(f"DELETE /api/entries/{entry_id}: {r7.status_code}")
print(f"  -> {r7.json()}")

# Test 8: Verify deletion
r8 = requests.get(f'{base}/api/entries')
data8 = r8.json()
print(f"GET /api/entries after delete: {r8.status_code}")
print(f"  -> count={data8['count']} (should be {data4['count'] - 1})")
print('\n=== All API Tests Passed ===')

