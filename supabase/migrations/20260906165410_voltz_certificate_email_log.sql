create or replace function public.voltz_certificate_email_log_server(
  p_user uuid,
  p_status text,
  p_provider text default null,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_user not in ('service_role','postgres') then
    raise exception 'Server only';
  end if;
  if p_status not in ('sent','failed') then
    raise exception 'Invalid status';
  end if;
  insert into voltz_admin.email_logs(user_id,type,status,provider_id,error_safe)
  values(
    p_user,
    'certificate',
    p_status,
    nullif(left(coalesce(p_provider,''),500),''),
    nullif(left(coalesce(p_error,''),1000),'')
  );
end;
$$;
revoke execute on function public.voltz_certificate_email_log_server(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.voltz_certificate_email_log_server(uuid,text,text,text) to service_role;
