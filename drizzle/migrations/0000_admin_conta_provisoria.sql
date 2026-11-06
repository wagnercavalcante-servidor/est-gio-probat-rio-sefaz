CREATE OR REPLACE FUNCTION public.conceder_admin_email_autorizado()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.email_confirmed_at is not null
     and lower(new.email) in ('wagner.cavalcante@seplag.ce.gov.br', 'acesso.provisorio@estagioprobatorio.app') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::public.app_role)
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$function$;