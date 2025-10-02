// components/estadisticas/GraficosEstadisticas.jsx - Gráficos de estadísticas
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function GraficosEstadisticas({ estadisticas, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!estadisticas || !estadisticas.temporal) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-gray-500">
          <p>No hay datos temporales para mostrar gráficos</p>
        </div>
      </div>
    );
  }

  const { temporal } = estadisticas;
  
  // Formatear datos para gráficos
  const ventasPorHora = temporal.ventas_por_hora?.map(item => ({
    hora: `${item.hora}:00`,
    pedidos: item.pedidos,
    ingresos: parseFloat(item.ingresos) || 0,
    ticket_promedio: item.ticket_promedio_hora || 0
  })) || [];

  const ventasPorDia = temporal.ventas_por_dia_semana?.map(item => ({
    dia: item.nombre_dia,
    pedidos: item.pedidos,
    ingresos: parseFloat(item.ingresos) || 0
  })) || [];

  const tendenciaMensual = temporal.tendencia_mensual?.map(item => ({
    mes: item.mes,
    pedidos: item.pedidos,
    ingresos: parseFloat(item.ingresos) || 0,
    productos: item.productos_vendidos
  })) || [];

  // Datos para productos más vendidos (convertir a formato de gráfico)
  const productosData = estadisticas.rankings?.productos_mas_vendidos?.slice(0, 5).map(item => ({
    nombre: item.nombre_producto?.length > 20 
      ? `${item.nombre_producto.substring(0, 20)}...` 
      : item.nombre_producto,
    cantidad: item.total_vendido,
    ingresos: parseFloat(item.ingresos_producto) || 0
  })) || [];

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor || 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de ventas por hora */}
      {ventasPorHora.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Franja Horaria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ventasPorHora}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'ingresos' ? formatearMoneda(value) : value,
                  name === 'pedidos' ? 'Pedidos' : 'Ingresos'
                ]}
              />
              <Legend />
              <Bar dataKey="pedidos" fill="#8884d8" name="Pedidos" />
              <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de ventas por día */}
      {ventasPorDia.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Día de la Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ventasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'ingresos' ? formatearMoneda(value) : value,
                  name === 'pedidos' ? 'Pedidos' : 'Ingresos'
                ]}
              />
              <Legend />
              <Bar dataKey="pedidos" fill="#ffc658" name="Pedidos" />
              <Bar dataKey="ingresos" fill="#ff7c7c" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tendencia mensual */}
      {tendenciaMensual.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia Mensual</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tendenciaMensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'ingresos' ? formatearMoneda(value) : value,
                  name === 'pedidos' ? 'Pedidos' : 
                  name === 'productos' ? 'Productos' : 'Ingresos'
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="pedidos" stroke="#8884d8" strokeWidth={2} name="Pedidos" />
              <Line type="monotone" dataKey="ingresos" stroke="#82ca9d" strokeWidth={2} name="Ingresos" />
              <Line type="monotone" dataKey="productos" stroke="#ffc658" strokeWidth={2} name="Productos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top productos */}
      {productosData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Productos Más Vendidos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={productosData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {productosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}