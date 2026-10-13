import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection, LEGAL_CONTACT } from '@/components/store/LegalPage'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo Vèloire recolecta, usa y protege tus datos personales, conforme a la Ley 1581 de 2012.',
}

export default function PrivacidadPage() {
  const { owner, email, city } = LEGAL_CONTACT

  return (
    <LegalPage
      eyebrow="Política de privacidad"
      title="Tus datos, cuidados"
      intro="Esta política explica qué datos personales recolectamos en Vèloire, para qué los usamos y cómo puedes ejercer tus derechos, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013."
    >
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable de tus datos es <strong>{owner}</strong>, persona natural, propietaria de la
          tienda Vèloire, con domicilio en {city}.
        </p>
        <p>
          Correo para asuntos de datos personales: <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos recolectamos">
        <ul>
          <li><strong>Datos de tu cuenta:</strong> nombre, correo electrónico y contraseña (la contraseña se guarda cifrada; nunca la vemos).</li>
          <li><strong>Datos de contacto y entrega:</strong> celular, dirección, barrio y las notas que agregues a tu pedido.</li>
          <li><strong>Historial de compras:</strong> productos, tonos, cantidades, montos y estado de tus pedidos.</li>
          <li><strong>Reseñas:</strong> la calificación y el comentario que publiques, junto con tu nombre.</li>
          <li><strong>Datos de navegación:</strong> páginas visitadas y tipo de dispositivo, solo si aceptas las cookies de analíticas.</li>
        </ul>
        <p>
          No recolectamos datos de tarjetas ni de cuentas bancarias: los pagos se hacen por
          transferencia directa a Nequi o Bancolombia.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué los usamos">
        <ul>
          <li>Procesar, preparar y entregar tus pedidos.</li>
          <li>Contactarte sobre el estado de tu pedido por correo o WhatsApp.</li>
          <li>Gestionar tu cuenta y tu historial de compras.</li>
          <li>Atender preguntas, cambios, devoluciones y garantías.</li>
          <li>Mostrar las reseñas que publiques en la página del producto.</li>
          <li>Entender cómo se usa la tienda para mejorarla (solo con tu consentimiento de cookies).</li>
          <li>Cumplir obligaciones legales.</li>
        </ul>
        <p>
          <strong>No vendemos ni compartimos tus datos con terceros para publicidad</strong>, y no te
          enviaremos mensajes promocionales sin tu autorización.
        </p>
      </LegalSection>

      <LegalSection title="4. Tus derechos">
        <p>Como titular de tus datos tienes derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Pedir prueba de la autorización que nos diste.</li>
          <li>Saber cómo hemos usado tus datos.</li>
          <li>Revocar tu autorización y pedir que eliminemos tus datos, cuando no exista un deber legal de conservarlos.</li>
          <li>Acceder gratis a tus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Cómo ejercer tus derechos">
        <p>
          Escríbenos a <a href={`mailto:${email}`}>{email}</a> indicando tu nombre, el correo de tu
          cuenta y lo que necesitas. Tus datos de perfil también los puedes actualizar tú misma desde{' '}
          <Link href="/cuenta">Mi cuenta</Link>.
        </p>
        <ul>
          <li><strong>Consultas</strong> (saber qué datos tenemos): respondemos en máximo 10 días hábiles.</li>
          <li><strong>Reclamos</strong> (corregir, actualizar o eliminar datos): respondemos en máximo 15 días hábiles.</li>
        </ul>
        <p>Si necesitamos más tiempo, te avisaremos antes de que venza el plazo, como lo permite la ley.</p>
      </LegalSection>

      <LegalSection title="6. Con quién compartimos tus datos">
        <p>
          Solo con proveedores que nos ayudan a operar la tienda y que tratan los datos por nuestra cuenta
          y con medidas de seguridad:
        </p>
        <ul>
          <li><strong>Supabase:</strong> base de datos y autenticación de cuentas.</li>
          <li><strong>Resend:</strong> envío de correos sobre tus pedidos.</li>
          <li><strong>Google Analytics:</strong> estadísticas de uso, solo si aceptas las cookies de analíticas.</li>
          <li><strong>Proveedor de alojamiento web</strong> donde funciona la tienda.</li>
        </ul>
        <p>
          Algunos de estos proveedores tienen servidores fuera de Colombia. Al usar la tienda autorizas
          esa transferencia, que se hace con proveedores que ofrecen niveles adecuados de protección.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>Usamos dos tipos:</p>
        <ul>
          <li>
            <strong>Necesarias:</strong> mantienen tu sesión iniciada y recuerdan tu carrito y tu
            preferencia de modo claro u oscuro. Sin ellas la tienda no funciona.
          </li>
          <li>
            <strong>Analíticas (Google Analytics):</strong> nos dicen cuántas personas visitan la tienda
            y qué productos ven. Solo se activan si las aceptas.
          </li>
        </ul>
        <p>Puedes cambiar tu decisión cuando quieras desde “Configurar cookies”, al final de cualquier página.</p>
      </LegalSection>

      <LegalSection title="8. Seguridad y conservación">
        <p>
          Protegemos tus datos con conexiones cifradas, contraseñas cifradas y acceso restringido solo a
          quienes administran la tienda. Los conservamos mientras tengas una cuenta o mientras sean
          necesarios para atender tus pedidos, garantías y obligaciones legales.
        </p>
      </LegalSection>

      <LegalSection title="9. Menores de edad">
        <p>
          Las compras deben hacerlas personas mayores de edad. Si eres menor, hazlo con la autorización y
          el acompañamiento de tu madre, padre o representante legal.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios a esta política">
        <p>
          Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha de
          actualización. Los cambios importantes te los avisaremos por correo.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
