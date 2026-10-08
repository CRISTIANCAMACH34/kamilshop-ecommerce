import sys
sys.path.insert(0, '.')
import urllib.request
import json

def run_tests():
    # 1. Crear Orden Real
    req_data = {
        'name': 'Andres Felipe Martinez',
        'email': 'andres.felipe@gmail.com',
        'phone': '+57 301 222 3344',
        'address': 'Carrera 15 #85-30, Chapinero',
        'city': 'Bogota',
        'carrier': 'Coordinadora Express',
        'total': 210000.0,
        'subtotal': 190000.0,
        'tax': 20000.0,
        'shipping_fee': 0.0,
        'provider': 'web_store',
        'items': [{'name': 'Chaqueta Bomber New York', 'size': 'L', 'sku': 'KML-BMB-01', 'qty': 1, 'price': 210000.0, 'color': 'Negro'}]
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/orders',
        data=json.dumps(req_data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    res = urllib.request.urlopen(req)
    created = json.loads(res.read().decode())
    print('1. CREATED ORDER:', created['code'], created['id'], created['customer'])

    # 2. Consultar listado de ordenes
    orders_res = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/v1/orders').read().decode())
    print('2. TOTAL REAL ORDERS IN DB:', len(orders_res))
    assert len(orders_res) == 1
    assert orders_res[0]['customer'] == 'Andres Felipe Martinez'

    # 3. Consultar clientes en BD
    cust_res = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/v1/admin/customers').read().decode())
    print('3. TOTAL REAL CUSTOMERS IN DB:', len(cust_res))
    assert len(cust_res) == 1
    assert cust_res[0]['name'] == 'Andres Felipe Martinez'

    # 4. Actualizar estado
    order_id = created['id']
    patch_data = {'status': 'EN_PICKING'}
    patch_req = urllib.request.Request(
        f'http://127.0.0.1:8000/api/v1/orders/{order_id}/status',
        data=json.dumps(patch_data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    patch_res = json.loads(urllib.request.urlopen(patch_req).read().decode())
    print('4. UPDATED STATUS:', patch_res['status'])
    assert patch_res['status'] == 'EN_PICKING'

    # 5. Eliminar orden y verificar BD limpia
    del_req = urllib.request.Request(
        f'http://127.0.0.1:8000/api/v1/orders/{order_id}',
        method='DELETE'
    )
    del_res = json.loads(urllib.request.urlopen(del_req).read().decode())
    print('5. DELETE RESULT:', del_res)

    # 6. Limpiar cliente de prueba
    from app.infrastructure.database import SessionLocal, CustomerModel
    db = SessionLocal()
    db.query(CustomerModel).delete()
    db.commit()

    # 7. Verificar que quedo en 0 ordenes y 0 clientes
    final_orders = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/v1/orders').read().decode())
    final_customers = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/v1/admin/customers').read().decode())
    print('6. FINAL ORDERS IN DB:', len(final_orders))
    print('7. FINAL CUSTOMERS IN DB:', len(final_customers))
    assert len(final_orders) == 0
    assert len(final_customers) == 0

    print('ALL END-TO-END DATABASE PERSISTENCE TESTS PASSED 100% PERFECTLY!')

if __name__ == '__main__':
    run_tests()
