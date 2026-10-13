import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, LegalSection, LEGAL_CONTACT } from '@/components/store/LegalPage'
import { PAYMENT_WINDOW_HOURS } from '@/lib/orders'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Condiciones de compra en Vèloire: pedidos, pagos, envíos, cambios y garantías.',
}

export default function TerminosPage() {
  const { owner, email, city } = LEGAL_CONTACT

  return (
    <LegalPage
      eyebrow="Términos y condiciones"
      title="Comprar con tranquilidad"
      intro="Estas son las condiciones para usar la tienda y comprar en Vèloire. Al crear una cuenta o hacer un pedido, las aceptas."
    >
      <LegalSection title="1. Quiénes somos">
        <p>
          Vèloire es una tienda de maquillaje en línea de <strong>{owner}</strong>, con domicilio en {city}.
          Puedes escribirnos a <a href={`mailto:${email}`}>{email}</a> o por los canales de{' '}
          <Link href="/contacto">Contacto</Link>.
        </p>
      </LegalSection>

      <LegalSection title="2. Tu cuenta">
        <ul>
          <li>Para comprar necesitas una cuenta con datos reales y actualizados.</li>
          <li>Eres responsable de mantener tu contraseña en secreto y de lo que se haga con tu cuenta.</li>
          <li>Las compras deben hacerlas personas mayores de edad, o menores con autorización de su representante legal.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Productos y precios">
        <ul>
          <li>Todos los precios están en pesos colombianos (COP).</li>
          <li>Los colores de los tonos pueden verse un poco distintos según la pantalla de tu dispositivo.</li>
          <li>
            El precio que aplica es el vigente al momento de confirmar tu pedido. Si hubiera un error
            evidente de precio, te avisaremos y podrás decidir si continúas o cancelas sin costo.
          </li>
          <li>Todos los productos están sujetos a disponibilidad.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Pedidos y pagos">
        <ul>
          <li>
            Al confirmar tu pedido, <strong>apartamos tus productos por {PAYMENT_WINDOW_HOURS} horas</strong>{' '}
            para que hagas la transferencia. Si en ese tiempo no recibimos el pago, el pedido se cancela
            automáticamente y los productos vuelven a estar disponibles.
          </li>
          <li>Tu pedido se confirma cuando verificamos el pago; te avisamos por correo.</li>
          <li>Aceptamos pagos por transferencia a Nequi.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Envíos">
        <p>
          Hacemos domicilios dentro de Pasto, Nariño, en 1 a 2 días hábiles después de confirmar el pago.
          El costo del domicilio se muestra antes de confirmar la compra. Más detalles en nuestra{' '}
          <Link href="/envios">política de envíos</Link>.
        </p>
      </LegalSection>

      <LegalSection title="6. Cancelaciones">
        <ul>
          <li>Puedes cancelar tu pedido mientras esté pendiente de pago, desde la página de tu pedido (la encuentras en Mi cuenta).</li>
          <li>
            Podemos cancelar un pedido si no recibimos el pago a tiempo, si hay un error evidente de precio o
            si un producto se agota por una falla nuestra. Si ya habías pagado, te devolvemos el dinero completo.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Cambios, devoluciones y garantía">
        <ul>
          <li>
            Si tu pedido llega en mal estado, incompleto o con un producto equivocado, escríbenos dentro de las{' '}
            <strong>24 horas siguientes a la entrega</strong> con una foto, y lo solucionamos con un cambio o la
            devolución del dinero.
          </li>
          <li>
            Por higiene, no aceptamos cambios ni devoluciones de productos abiertos o usados, salvo que el
            problema sea nuestro.
          </li>
          <li>
            Los productos tienen la <strong>garantía legal</strong> de calidad, idoneidad y seguridad que
            establece la Ley 1480 de 2011. Si un producto presenta un defecto de fabricación, contáctanos.
          </li>
          <li>
            Conforme al artículo 47 de la Ley 1480 de 2011, el derecho de retracto no aplica a bienes de uso
            personal como el maquillaje.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Uso de los productos">
        <p>
          Revisa los ingredientes antes de usar cualquier producto y, si tienes piel sensible o alergias,
          haz una prueba en una zona pequeña de la piel. Suspende su uso si notas irritación.
        </p>
      </LegalSection>

      <LegalSection title="9. Reseñas">
        <p>
          Solo pueden dejar reseñas quienes compraron el producto. Pedimos que sean respetuosas y sobre el
          producto; podemos retirar contenido ofensivo, falso o que no tenga relación con él.
        </p>
      </LegalSection>

      <LegalSection title="10. Propiedad intelectual">
        <p>
          La marca Vèloire, el logo, las fotografías y los textos de la tienda nos pertenecen o los usamos con
          autorización. No puedes copiarlos ni usarlos con fines comerciales sin nuestro permiso.
        </p>
      </LegalSection>

      <LegalSection title="11. Tus datos personales">
        <p>
          Tratamos tus datos según nuestra <Link href="/privacidad">política de privacidad</Link>.
        </p>
      </LegalSection>

      <LegalSection title="12. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de Colombia. Si tienes una queja que no hayamos resuelto,
          puedes acudir a la Superintendencia de Industria y Comercio (SIC).
        </p>
      </LegalSection>
    </LegalPage>
  )
}
